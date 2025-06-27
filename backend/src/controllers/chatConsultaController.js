const { ChatConsulta, ChatSessao } = require('../models');

/**
 * Registra uma nova pergunta (consulta) feita pelo usuário dentro de uma sessão.
 */
exports.criarConsulta = async (req, res) => {
    try {
        const { pergunta, sessao_id } = req.body;

        // Validação dos dados de entrada
        if (!pergunta || !sessao_id) {
            return res.status(400).json({ message: 'Os campos "pergunta" e "sessao_id" são obrigatórios.' });
        }

        // analisar se a sessão existe
        const sessao = await ChatSessao.findByPk(sessao_id);
        if (!sessao) {
            return res.status(404).json({ message: 'Sessão de chat não encontrada.' });
        }

        const novaConsulta = await ChatConsulta.create({
            pergunta,
            sessao_id
        });

        res.status(201).json(novaConsulta);

    } catch (error) {
        res.status(500).json({ message: "Erro ao registrar consulta.", error: error.message });
    }
};

//listar todas as consultas de uma respectiva sessão
exports.pegarConsultasPorSessao = async (req, res) => {
    try {
        const { sessao_id } = req.params; // Pega o ID da sessão da URL
        const consultas = await ChatConsulta.findAll({
            where: { sessao_id: sessao_id },
            order: [['createdAt', 'ASC']] // Ordena da mais antiga para a mais nova
        });

        res.status(200).json(consultas);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar consultas da sessão.", error: error.message });
    }
};
