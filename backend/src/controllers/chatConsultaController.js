// Importa todos os models necessários e o axios para a comunicação com a IA
const { ChatConsulta, ChatSessao, Subcategoria, ChatResposta, sequelize } = require('../models');
const axios = require('axios');

// URL do nosso serviço de IA que responde a perguntas
const AI_SERVICE_ASK_URL = 'http://localhost:8000/api/ask';

/**
 * Orquestra o fluxo completo de uma pergunta do chatbot:
 * 1. Valida os dados recebidos.
 * 2. Repassa a pergunta para o serviço de IA para a busca por similaridade e geração da resposta.
 * 3. Salva a pergunta e a resposta da IA na base de dados numa única transação.
 * 4. Retorna a resposta final da IA para o frontend.
 */
exports.criarConsultaEObterResposta = async (req, res) => {
    // Inicia uma transação para garantir a integridade dos dados
    const t = await sequelize.transaction();
    try {
        const { pergunta, sessao_id, subcategoria_id } = req.body;

        // Validação dos dados de entrada
        if (!pergunta || !sessao_id || !subcategoria_id) {
            await t.rollback();
            return res.status(400).json({ message: 'Os campos "pergunta", "sessao_id" e "subcategoria_id" são obrigatórios.' });
        }

        // --- Passo 1: Interação com o Serviço de IA ---
        console.log(`[Node.js] Repassando pergunta para a IA: "${pergunta}"`);
        const responseIA = await axios.post(AI_SERVICE_ASK_URL, { question: pergunta });

        // ✅ CORREÇÃO: Extrai tanto a resposta quanto o ID do documento fonte.
        const textoRespostaIA = responseIA.data.answer;
        const documentoFonteId = responseIA.data.source_document_id; // Espera este novo campo da IA

        if (!textoRespostaIA) {
            throw new Error("O serviço de IA não retornou uma resposta de texto válida.");
        }
        console.log(`[Node.js] Resposta recebida. Documento fonte ID: ${documentoFonteId || 'Nenhum'}`);
        
        // --- Passo 2: Salvando no Banco de Dados ---
        // Cria o registo da consulta (a pergunta do utilizador)
        const novaConsulta = await ChatConsulta.create({
            pergunta,
            sessao_id,
            subcategoria_id
        }, { transaction: t });

        // ✅ CORREÇÃO: Passa o 'documentoFonteId' ao criar a resposta.
        // Se for null, o Sequelize salvará o campo como nulo, o que está correto.
        const novaResposta = await ChatResposta.create({
            texto_resposta: textoRespostaIA,
            consulta_id: novaConsulta.id,
            documento_fonte: documentoFonteId
        }, { transaction: t });

        // Se tudo correu bem, confirma a transação
        await t.commit();

        // 3. Retorna a resposta da IA e o ID da resposta salva para o frontend
        // O frontend usará o 'resposta_id' para o sistema de feedback.
        res.status(201).json({
            answer: novaResposta.texto_resposta,
            resposta_id: novaResposta.id 
        });

    } catch (error) {
        // Se qualquer passo falhar (a chamada à IA ou a escrita no banco), desfaz tudo.
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