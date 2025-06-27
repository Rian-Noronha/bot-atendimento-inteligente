const { ChatConsulta, ChatSessao, Subcategoria } = require('../models');

/**
 * Registra uma nova pergunta (consulta) feita pelo usuário dentro de uma sessão.
 * CORRIGIDO: Agora também exige e salva o 'subcategoria_id'.
 */
exports.criarConsulta = async (req, res) => {
    try {
        // 1. Pega TODOS os campos necessários do corpo da requisição
        const { pergunta, sessao_id, subcategoria_id } = req.body;

        // 2. Validação dos dados de entrada atualizada
        if (!pergunta || !sessao_id || !subcategoria_id) {
            return res.status(400).json({ message: 'Os campos "pergunta", "sessao_id" e "subcategoria_id" são obrigatórios.' });
        }

        // 3. Validações de existência (opcional, mas uma boa prática)
        const sessao = await ChatSessao.findByPk(sessao_id);
        if (!sessao) {
            return res.status(404).json({ message: 'Sessão de chat não encontrada.' });
        }
        const subcategoria = await Subcategoria.findByPk(subcategoria_id);
        if (!subcategoria) {
            return res.status(404).json({ message: 'Subcategoria não encontrada.' });
        }

        // 4. Cria o novo registo com todos os dados
        const novaConsulta = await ChatConsulta.create({
            pergunta,
            sessao_id,
            subcategoria_id // Incluindo a subcategoria
        });

        res.status(201).json(novaConsulta);

    } catch (error) {
        res.status(500).json({ message: "Erro ao registar consulta.", error: error.message });
    }
};

/**
 * Lista todas as consultas de uma sessão específica.
 */
exports.pegarConsultasPorSessao = async (req, res) => {
    try {
        const { sessao_id } = req.params;
        const consultas = await ChatConsulta.findAll({
            where: { sessao_id: sessao_id },
            include: [{ model: Subcategoria, as: 'subcategoria', attributes: ['nome'] }], // Inclui o nome da subcategoria
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(consultas);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar consultas da sessão.", error: error.message });
    }
};
