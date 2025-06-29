// Importamos os models, o sequelize e o axios para fazer chamadas HTTP
const { Documento, Subcategoria, Categoria, PalavraChave, sequelize } = require('../models');
const axios = require('axios');

// URL do nosso serviço de IA que gera os embeddings
const AI_SERVICE_URL = 'http://localhost:8001/api/create-embedding';

/**
 * Função auxiliar para preparar o texto e obter o embedding do serviço de IA.
 * @param {object} docData - Os dados do documento (titulo, descricao, solucao, etc.).
 * @returns {Promise<Array<number>|null>} O vetor de embedding ou nulo em caso de erro.
 */
async function getEmbeddingFromAIService(docData) {
    try {
        // Constrói o texto otimizado para a geração do embedding
        const textoParaEmbedding = `Título: ${docData.titulo}\n\nDescrição: ${docData.descricao || ''}\n\nSolução: ${docData.solucao}`;
        
        console.log("A solicitar embedding do serviço de IA...");
        const responseIA = await axios.post(AI_SERVICE_URL, { text_to_embed: textoParaEmbedding });
        
        if (responseIA.data && responseIA.data.embedding) {
            console.log("Embedding recebido com sucesso.");
            return responseIA.data.embedding;
        }
        throw new Error("Resposta do serviço de IA não continha um embedding válido.");
    } catch (error) {
        console.error("ERRO ao comunicar com o serviço de IA para obter o embedding:", error.message);
        // Retornamos nulo para que o documento possa ser salvo mesmo se a IA falhar,
        // mas logamos o erro. Uma estratégia de "tentar novamente" poderia ser implementada aqui.
        return null; 
    }
}


// --- Funções de Leitura (Não interagem com a IA) ---

exports.pegarTodosDocumentos = async (req, res) => {
    try {
        const documentos = await Documento.findAll({
            // Excluímos o campo de embedding para não enviar dados pesados na listagem
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


// --- Funções de Escrita (INTERAGEM COM A IA) ---

exports.criarDocumento = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { titulo, descricao, solucao, subcategoria_id, palavrasChaveIds, ativo, urlArquivo, tipo_documento } = req.body;

        if (!titulo || !solucao || !subcategoria_id) {
            await t.rollback();
            return res.status(400).json({ message: "Título, solução e ID da subcategoria são obrigatórios." });
        }

        // 1. Pede o embedding ao serviço de IA
        const embedding = await getEmbeddingFromAIService({ titulo, descricao, solucao });

        // 2. Cria o documento no banco, incluindo o embedding recebido
        const novoDocumento = await Documento.create({
            titulo, descricao, solucao, subcategoria_id, ativo, urlArquivo, tipo_documento,
            embedding: embedding // Salva o vetor aqui
        }, { transaction: t });

        // Associa as palavras-chave
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
        console.error("Erro detalhado ao criar documento:", error);
        res.status(500).json({ message: "Erro ao criar documento.", error: error.message });
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
        
        // 1. Pede um novo embedding com os dados atualizados
        const embedding = await getEmbeddingFromAIService({ 
            titulo: dadosDocumento.titulo || documento.titulo,
            descricao: dadosDocumento.descricao || documento.descricao,
            solucao: dadosDocumento.solucao || documento.solucao
        });

        // Adiciona o novo embedding aos dados a serem atualizados
        dadosDocumento.embedding = embedding;

        // 2. Atualiza o documento no banco
        await documento.update(dadosDocumento, { transaction: t });

        if (palavrasChaveIds && Array.isArray(palavrasChaveIds)) {
             await documento.setPalavrasChave(palavrasChaveIds, { transaction: t });
        }

        await t.commit();
        
        const documentoAtualizado = await Documento.findByPk(id, {
            attributes: { exclude: ['embedding'] },
            include: [ { model: Subcategoria, as: 'subcategoria' }, { model: PalavraChave, as: 'palavrasChave' }]
        });

        res.status(200).json(documentoAtualizado);

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: "Erro ao atualizar documento.", error: error.message });
    }
};

exports.deletarDocumento = async (req, res) => {
    // A lógica de exclusão não precisa de chamar a IA.
    // O registo é simplesmente apagado do banco de dados.
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
