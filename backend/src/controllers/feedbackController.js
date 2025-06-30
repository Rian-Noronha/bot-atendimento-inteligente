const { Feedback, ChatResposta, ChatConsulta, AssuntoPendente, Subcategoria } = require('../models');

/**
 * Cria um novo feedback para uma resposta.
 * Se o feedback for negativo (util: false), também cria um Assunto Pendente.
 */
exports.criarFeedback = async (req, res) => {
    try {
        const { util, comentario, nota, resposta_id } = req.body;

        if (util === undefined || !resposta_id) {
            return res.status(400).json({ message: 'Os campos "util" (true/false) e "resposta_id" são obrigatórios.' });
        }

        const resposta = await ChatResposta.findByPk(resposta_id, {
            include: [{
                model: ChatConsulta,
                as: 'consulta',
                include: [{
                    model: Subcategoria,
                    as: 'subcategoria'
                }]
            }]
        });
        
        if (!resposta) {
            return res.status(404).json({ message: 'Resposta de chat associada não encontrada.' });
        }

        const novoFeedback = await Feedback.create({ 
            util, 
            comentario, 
            nota, 
            resposta_id,
            data_feedback: new Date()
        });

        // Se o feedback foi negativo, cria um Assunto Pendente
        if (util === false) {
            // Garante que a consulta e a subcategoria existem antes de tentar usá-las
            if (resposta.consulta && resposta.consulta.subcategoria) {
                await AssuntoPendente.create({
                    consulta_id: resposta.consulta.id,
                    texto_assunto: resposta.consulta.pergunta,
                    // Passando o ID da subcategoria que buscamos na consulta
                    subcategoria_id: resposta.consulta.subcategoria.id, 
                    status: 'pendente'
                });
                console.log(`Assunto pendente criado para a consulta ID: ${resposta.consulta.id}`);
            } else {
                console.error("Não foi possível criar o assunto pendente: consulta ou subcategoria não encontrada na resposta.");
            }
        }

        res.status(201).json(novoFeedback);

    } catch (error) {
        res.status(500).json({ message: "Erro ao registrar feedback.", error: error.message });
    }
};

/**
 * Lista todos os feedbacks recebidos.
 */
exports.pegarTodosFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll({
            include: [{
                model: ChatResposta,
                as: 'resposta',
                attributes: ['id', 'texto_resposta']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar feedbacks.", error: error.message });
    }
};
