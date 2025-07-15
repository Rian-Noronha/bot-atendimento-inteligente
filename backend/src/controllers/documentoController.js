const { Documento, Subcategoria, Categoria, PalavraChave, sequelize } = require('../models');
const axios = require('axios');
const AI_SERVICE_PROCESS_URL = 'http://localhost:8000/api/documents/process';

/**
 * operar criação manual do processamento de texto/arquivo.
 * O frontend determina qual fluxo seguir e envia os dados apropriados.
 */
exports.criarDocumento = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        // Os dados vêm do frontend, que já separou o fluxo manual do de arquivo.
        const { 
            titulo, 
            descricao, 
            solucao, 
            subcategoria_id, 
            palavrasChave, // Assumindo que o frontend envia um array de strings
            urlArquivo 
        } = req.body;

        // Monta a requisição para o serviço de IA
        const payloadParaIA = {
            titulo,
            descricao,
            subcategoria_id,
            palavras_chave: palavrasChave || [], // Garante que seja um array
            solucao: solucao || null, // Envia a solução se for manual
            url_arquivo: urlArquivo || null // Envia a URL se for por arquivo
        };
        
        console.log(`[Node.js] Enviando dados para o serviço de IA:`, payloadParaIA);

        // Chama o único endpoint de processamento da IA
        const responseIA = await axios.post(AI_SERVICE_PROCESS_URL, payloadParaIA);
        
        // O serviço de IA sempre retorna uma lista de documentos/chunks processados
        const documentosProcessados = responseIA.data.data;
        
        console.log(`[Node.js] IA retornou ${documentosProcessados.length} documento(s) para salvar.`);

        // Usa bulkCreate para inserir todos os chunks de uma vez, o que é mais eficiente
        const novosDocumentos = await Documento.bulkCreate(documentosProcessados, { transaction: t });

        // Lógica para associar palavras-chave (se houver)
        // Esta lógica se aplicará a todos os chunks criados a partir de um documento
        if (palavrasChave && palavrasChave.length > 0) {
            const promises = palavrasChave.map(p => PalavraChave.findOrCreate({
                where: { palavra: p.trim().toLowerCase() },
                defaults: { palavra: p.trim().toLowerCase() },
                transaction: t
            }));
            const results = await Promise.all(promises);
            const palavrasChaveInstances = results.map(result => result[0]);
            
            // Associa as palavras-chave a cada um dos novos documentos criados
            for (const doc of novosDocumentos) {
                await doc.addPalavrasChave(palavrasChaveInstances, { transaction: t });
            }
        }

        await t.commit();
        res.status(201).json({ 
            message: 'Documento(s) processado(s) e salvo(s) com sucesso.', 
            documentos_criados: novosDocumentos.length 
        });

    } catch (error) {
        await t.rollback();
        let errorMessage = `Erro ao criar documento: ${error.message}`;
        if (error.response) {
            errorMessage = `Erro retornado pela API de IA: ${JSON.stringify(error.response.data)}`;
        }
        console.error("[Node.js] ERRO DETALHADO AO CRIAR DOCUMENTO:", error);
        res.status(500).json({ message: errorMessage });
    }
};


/**
 * ATUALIZAÇÃO DE DOCUMENTO (Refatorado)
 * Agora, a atualização também passa pelo serviço de IA para recalcular o embedding.
 * Nota: Esta função assume que a atualização é sempre de um único documento (não de chunks).
 */
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
        
        // Prepara o payload para o serviço de IA recalcular o embedding
        const payloadParaIA = {
            titulo: dadosDocumento.titulo || documento.titulo,
            descricao: dadosDocumento.descricao || documento.descricao,
            subcategoria_id: dadosDocumento.subcategoria_id || documento.subcategoria_id,
            solucao: dadosDocumento.solucao || documento.solucao, // Pega a nova solução
        };

        const responseIA = await axios.post(AI_SERVICE_PROCESS_URL, payloadParaIA);
        const documentoProcessado = responseIA.data.data[0]; // Pega o único documento processado

        // Atualiza o campo de embedding com o novo valor calculado pela IA
        dadosDocumento.embedding = documentoProcessado.embedding;

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
        res.status(500).json({ message: `Erro ao atualizar documento: ${error.message}` });
    }
};


// --- Funções de Leitura e Deleção (Permanecem as mesmas) ---

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
