const { ChatSessao, Usuario } = require('../models');

/**
 * Inicia uma nova sessão de chat para um usuário específico.
 * Para desenvolvimento, o ID do usuário é passado no corpo da requisição.
 */
exports.iniciarSessao = async (req, res) => {
    try {
        // Sem auth, pegar o ID do usuário diretamente do corpo da requisição.
        const { usuario_id } = req.body;

        if (!usuario_id) {
            return res.status(400).json({ message: 'O campo usuario_id é obrigatório.' });
        }

        // Verifica se o usuário existe antes de criar a sessão
        const usuario = await Usuario.findByPk(usuario_id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado para iniciar a sessão.' });
        }

        const novaSessao = await ChatSessao.create({
            usuario_id: usuario_id
            // O campo registro_inicio é definido por padrão pelo banco de dados
        });

        res.status(201).json({ 
            message: 'Sessão iniciada com sucesso.',
            sessao: novaSessao 
        });

    } catch (error) {
        res.status(500).json({ message: "Erro ao iniciar sessão de chat.", error: error.message });
    }
};




/**
 * Encerra uma sessão de chat, registrando a data/hora de término.
 * VERSÃO DE DEBUG: Primeiro busca, depois atualiza.
 */
exports.encerrarSessao = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`--- TENTANDO ENCERRAR SESSÃO ID: ${id} ---`);

        // Passo 1: Tenta encontrar a sessão pelo seu ID (Primary Key)
        const sessao = await ChatSessao.findByPk(id);

        // Passo 2: Verifica se a sessão foi encontrada
        if (sessao) {
            console.log(`Sessão ID ${id} encontrada! Atualizando...`);
            
            // Passo 3: Se encontrou, atualiza o campo 'registro_fim' e salva
            sessao.registro_fim = new Date();
            await sessao.save();

            res.status(200).json({
                message: 'Sessão encerrada com sucesso.',
                sessao: sessao
            });
        } else {
            // Se findByPk retornou null, a sessão realmente não foi encontrada no banco
            console.log(`AVISO: Sessão ID ${id} não encontrada no banco de dados.`);
            res.status(404).json({ message: 'Sessão de chat não encontrada.' });
        }
    } catch (error) {
        console.error("ERRO DETALHADO:", error);
        res.status(500).json({ message: "Erro ao encerrar sessão de chat.", error: error.message });
    }
};


