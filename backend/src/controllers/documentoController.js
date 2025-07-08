// Importamos os models, o sequelize e o axios para fazer chamadas HTTP
const { Documento, Subcategoria, Categoria, PalavraChave, sequelize } = require('../models');
const axios = require('axios');
const AI_SERVICE_ANALYZE_URL = 'http://localhost:8000/api/analyze-document';
const AI_SERVICE_EMBEDDING_URL = 'http://localhost:8000/api/create-embedding';

/**
 * Função auxiliar para preparar o texto e obter o embedding do serviço de IA.
 * @param {object} docData - Os dados do documento (titulo, descricao, solucao).
 * @returns {Promise<Array<number>>} O vetor de embedding.
 * @throws {Error} Se a comunicação com a IA falhar ou a resposta for inválida.
 */
async function getEmbeddingFromAIService(docData) {
    try {
        const textoParaEmbedding = `Título: ${docData.titulo}\n\nDescrição: ${docData.descricao || ''}\n\nSolução: ${docData.solucao}`;
        
        console.log(`[Node.js] A solicitar embedding para: "${textoParaEmbedding.substring(0, 70)}..."`);
        const responseIA = await axios.post(AI_SERVICE_EMBEDDING_URL, { text_to_embed: textoParaEmbedding });
        
        if (responseIA.data && responseIA.data.embedding) {
            console.log("[Node.js] Embedding recebido com sucesso do serviço de IA.");
            return responseIA.data.embedding;
        }
        
        throw new Error("A resposta do serviço de IA não continha um embedding válido.");

    } catch (error) {
        let errorMessage = "Falha na comunicação com o serviço de IA. ";
        if (error.code === 'ECONNREFUSED') {
            errorMessage += `Não foi possível conectar-se a ${AI_SERVICE_URL}. Verifique se o serviço de IA está a rodar.`;
        } else if (error.response) {
            // Se a API da IA retornou um erro (ex: status 500)
            errorMessage += `A API da IA respondeu com o status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
        } else {
            errorMessage += error.message;
        }
        console.error(`[Node.js] ${errorMessage}`);
        throw new Error(errorMessage);
    }
}

/**
 *  Orquestra a criação automática de um documento a partir de uma URL.
 */
exports.iniciarProcessamentoAutomatico = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { urlArquivo } = req.body;
        if (!urlArquivo) {
            return res.status(400).json({ message: 'A URL do arquivo é obrigatória.' });
        }

        console.log(`[Node.js] Recebida solicitação para analisar URL: ${urlArquivo}`);
        
        // 1. Busca as categorias para enviar à IA
        const allCategories = await Categoria.findAll({
            include: [{ model: Subcategoria, as: 'subcategorias', attributes: ['id', 'nome'] }],
            attributes: ['id', 'nome']
        });

        // 2. Pede à IA para analisar o documento e extrair os dados
        const responseIA = await axios.post(AI_SERVICE_ANALYZE_URL, {
            file_url: urlArquivo,
            categories: allCategories
        });
        const dadosExtraidos = responseIA.data;

        console.log(`[Node.js] Dados recebidos da IA:`, dadosExtraidos);

        // 3. Prepara os dados para salvar no banco
        const dadosParaCriar = {
            titulo: dadosExtraidos.titulo,
            descricao: dadosExtraidos.descricao,
            solucao: dadosExtraidos.solucao,
            urlArquivo: urlArquivo,
            tipoDocumento: 'arquivo',
            ativo: true,
            subcategoria_id: dadosExtraidos.subcategoria_id
        };

        //  Gera o embedding para o novo conteúdo de texto
        dadosParaCriar.embedding = await getEmbeddingFromAIService(dadosParaCriar);

        // 4. Cria o documento no banco de dados
        const novoDocumento = await Documento.create(dadosParaCriar, { transaction: t });

        // 5. Cria ou associa as palavras-chave retornadas pela IA
        if (dadosExtraidos.palavras_chave && dadosExtraidos.palavras_chave.length > 0) {
            const promises = dadosExtraidos.palavras_chave.map(p => PalavraChave.findOrCreate({
                where: { palavra: p.trim().toLowerCase() },
                defaults: { palavra: p.trim().toLowerCase() },
                transaction: t
            }));
            const results = await Promise.all(promises);
            const palavrasChaveInstances = results.map(result => result[0]);
            await novoDocumento.addPalavrasChave(palavrasChaveInstances, { transaction: t });
        }
        
        await t.commit();
        res.status(201).json({ message: 'Documento processado e salvo com sucesso.', documento: novoDocumento });

    } catch (error) {
        await t.rollback();
        console.error("Erro no processamento automático:", error);
        res.status(500).json({ message: "Erro interno no servidor ao processar o documento." });
    }
};


// --- Funções de Leitura ---

exports.pegarTodosDocumentos = async (req, res) => {
    try {
        const documentos = await Documento.findAll({
            attributes: { exclude: ['embedding'] }, 
            include: [
                { model: Subcategoria, as: 'subcategoria', attributes: ['nome'], include: [{ model: Categoria, as: 'categoria', attributes: ['nome']}] },
                { model: PalavraChave, as: 'palavrasChave', attributes: ['id', 'palavra'], through: { attributes: [] } }
            ],
            order: [['id', 'DESC']]
        });
        res.status(200).json(documentos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar documentos", error: error.message });
    }
};

exports.pegarDocumentoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findByPk(id, {
            attributes: { exclude: ['embedding'] },
            include: [
                { model: Subcategoria, as: 'subcategoria', attributes: ['nome'], include: [{ model: Categoria, as: 'categoria', attributes: ['nome'] }] },
                { model: PalavraChave, as: 'palavrasChave', attributes: ['id', 'palavra'], through: { attributes: [] } }
            ]
        });
        if (documento) {
            res.status(200).json(documento);
        } else {
            res.status(404).json({ message: 'Documento não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar documento", error: error.message });
    }
};


// --- Funções de Escrita ---

exports.criarDocumento = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { titulo, descricao, solucao, subcategoria_id, palavrasChaveIds, ativo, urlArquivo, tipo_documento } = req.body;

        if (!titulo || !solucao || !subcategoria_id) {
            await t.rollback();
            return res.status(400).json({ message: "Título, solução e ID da subcategoria são obrigatórios." });
        }

        const embedding = await getEmbeddingFromAIService({ titulo, descricao, solucao });

        // --- LOGS DE DEPURAÇÃO ADICIONADOS ---
        console.log(`[Node.js] Tipo da variável 'embedding' recebida: ${typeof embedding}`);
        console.log(`[Node.js] É um array? ${Array.isArray(embedding)}`);
        if(Array.isArray(embedding)) {
            console.log(`[Node.js] Comprimento do embedding: ${embedding.length}`);
            console.log(`[Node.js] Primeiros 3 valores: [${embedding.slice(0,3).join(', ')}, ...]`);
        }
        // ------------------------------------

        const dadosParaCriar = {
            titulo, descricao, solucao, subcategoria_id, ativo, urlArquivo, tipo_documento,
            embedding: embedding 
        };
        
        console.log("[Node.js] A tentar criar o documento no banco de dados...");
        const novoDocumento = await Documento.create(dadosParaCriar, { transaction: t });
        
        console.log("[Node.js] Documento criado com sucesso no banco.");

        if (palavrasChaveIds && palavrasChaveIds.length > 0) {
            await novoDocumento.addPalavrasChave(palavrasChaveIds, { transaction: t });
        }

        await t.commit();
        
        const resultadoFinal = await Documento.findByPk(novoDocumento.id, {
            attributes: { exclude: ['embedding'] },
            include: [ { model: Subcategoria, as: 'subcategoria' }, { model: PalavraChave, as: 'palavrasChave' }]
        });

        res.status(201).json(resultadoFinal);

    } catch (error) {
        await t.rollback();
        console.error("[Node.js] ERRO DETALHADO AO CRIAR DOCUMENTO:", error);
        res.status(500).json({ message: `Erro ao criar documento: ${error.message}` });
    }
};

exports.atualizarDocumento = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { palavrasChaveIds, ...dadosDocumento } = req.body;
        const documento = await Documento.findByPk(id);
        if (!documento) {
            await t.rollback();
            return res.status(404).json({ message: 'Documento não encontrado.' });
        }
        
        const embedding = await getEmbeddingFromAIService({ 
            titulo: dadosDocumento.titulo || documento.titulo,
            descricao: dadosDocumento.descricao || documento.descricao,
            solucao: dadosDocumento.solucao || documento.solucao
        });
        dadosDocumento.embedding = embedding;

        await documento.update(dadosDocumento, { transaction: t });

        if (palavrasChaveIds && Array.isArray(palavrasChaveIds)) {
             await documento.setPalavrasChave(palavrasChaveIds, { transaction: t });
        }

        await t.commit();
        
        const documentoAtualizado = await Documento.findByPk(id, {
            attributes: { exclude: ['embedding'] },
            include: [ 
                { model: Subcategoria, as: 'subcategoria' }, 
                { model: PalavraChave, as: 'palavrasChave' }
            ]
        });
        res.status(200).json(documentoAtualizado);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: `Erro ao atualizar documento: ${error.message}` });
    }
};

exports.deletarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Documento.destroy({ where: { id: id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Documento não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar documento.", error: error.message });
    }
};
