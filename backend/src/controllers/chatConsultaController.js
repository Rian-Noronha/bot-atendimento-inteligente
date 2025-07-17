const redisClient = require('../config/redisClient');
const { ChatConsulta, ChatSessao, Subcategoria, ChatResposta, sequelize } = require('../models');
const axios = require('axios');

const AI_SERVICE_ASK_URL = 'http://localhost:8000/api/ask';

exports.criarConsultaEObterResposta = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { pergunta, sessao_id, subcategoria_id } = req.body;

        if (!pergunta || !sessao_id || !subcategoria_id) {
            await t.rollback();
            return res.status(400).json({ message: 'Os campos "pergunta", "sessao_id" e "subcategoria_id" são obrigatórios.' });
        }

        // --- INÍCIO DA LÓGICA DE CACHE COM REDIS ---
        const cacheKey = `ia_resposta:${subcategoria_id}:${pergunta.toLowerCase().trim()}`;
        const cachedResponse = await redisClient.get(cacheKey);

        let textoRespostaIA;
        let documentoFonteId;
        let urlFonte;
        let tituloFonte;

        if (cachedResponse) {
            // CACHE HIT! A resposta foi encontrada no cache.
            console.log(`[Node.js] CACHE HIT para a chave: ${cacheKey}`);
            const aiData = JSON.parse(cachedResponse);
            textoRespostaIA = aiData.answer;
            documentoFonteId = aiData.source_document_id;
            urlFonte = aiData.source_document_url;
            tituloFonte = aiData.source_document_title;
        } else {
            // CACHE MISS! A resposta não está no cache.
            console.log(`[Node.js] CACHE MISS. Repassando pergunta para a IA: "${pergunta}"`);

            // Sua lógica original de chamada à IA
            const responseIA = await axios.post(AI_SERVICE_ASK_URL, { question: pergunta });
            
            textoRespostaIA = responseIA.data.answer;
            documentoFonteId = responseIA.data.source_document_id;
            urlFonte = responseIA.data.source_document_url; 
            tituloFonte = responseIA.data.source_document_title;
            

            if (!textoRespostaIA) {
                throw new Error("O serviço de IA não retornou uma resposta de texto válida.");
            }
            
            // Salva o novo resultado no cache por 1 hora (3600 segundos)
            await redisClient.set(cacheKey, JSON.stringify(responseIA.data), { EX: 3600 });
            console.log(`[Node.js] Resposta da IA salva no cache.`);
        }
        // --- FIM DA LÓGICA DE CACHE ---
        
        console.log(`[Node.js] Resposta processada. Documento fonte ID: ${documentoFonteId || 'Nenhum'}`);
        
        // --- Sua lógica de banco de dados (permanece igual) ---
        const novaConsulta = await ChatConsulta.create({
            pergunta,
            sessao_id,
            subcategoria_id
        }, { transaction: t });

        // Cria o registo da resposta, associando-a à consulta que acabou de ser criada
        const novaResposta = await ChatResposta.create({
            texto_resposta: textoRespostaIA,
            consulta_id: novaConsulta.id,
            documento_fonte: documentoFonteId,
            url_fonte: urlFonte
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            answer: novaResposta.texto_resposta,
            resposta_id: novaResposta.id,
            consulta_id: novaConsulta.id,
            url_fonte: novaResposta.url_fonte,
            titulo_fonte: tituloFonte
        });

    } catch (error) {
        await t.rollback();
        console.error("Erro no fluxo de consulta e resposta:", error.message);
        res.status(500).json({ message: `Erro ao processar a pergunta: ${error.message}` });
    }
};

/**
 * Lista todas as consultas de uma sessão específica (função existente).
 */
exports.pegarConsultasPorSessao = async (req, res) => {
    try {
        const { sessao_id } = req.params;
        const consultas = await ChatConsulta.findAll({
            where: { sessao_id: sessao_id },
            include: [{ model: Subcategoria, as: 'subcategoria', attributes: ['nome'] }],
            order: [['createdAt', 'ASC']]
        });
        res.status(200).json(consultas);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar consultas da sessão.", error: error.message });
    }
};