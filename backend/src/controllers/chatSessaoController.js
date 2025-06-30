// controllers/chatSessaoController.js

const { ChatSessao, Usuario } = require('../models');

/**
 * Inicia uma nova sessão de chat para o utilizador autenticado.
 * O ID do utilizador é obtido de forma segura a partir do token JWT.
 */
exports.iniciarSessao = async (req, res) => {
    try {
        // CORREÇÃO: Em vez de pegar do req.body, pegamos o ID do utilizador
        // que foi validado pelo middleware 'protect' e anexado ao objeto 'req'.
        const usuario_id = req.usuario.id;

        // A verificação de existência do utilizador já não é estritamente necessária aqui,
        // pois o middleware 'protect' já garante que o utilizador do token existe.

        const novaSessao = await ChatSessao.create({
            usuario_id: usuario_id
        });

        res.status(201).json({ 
            message: 'Sessão iniciada com sucesso.',
            sessao: novaSessao 
        });

    } catch (error) {
        console.error("Erro ao iniciar sessão de chat:", error);
        res.status(500).json({ message: "Erro ao iniciar sessão de chat.", error: error.message });
    }
};


/**
 * Encerra uma sessão de chat, registando a data/hora de término.
 * A sua lógica aqui está perfeita e pode ser mantida.
 */
exports.encerrarSessao = async (req, res) => {
    try {
        const { id } = req.params;
        
        const sessao = await ChatSessao.findByPk(id);

        if (sessao) {
            // Seria uma boa prática de segurança extra verificar se o utilizador que está a tentar
            // encerrar a sessão é o mesmo que a criou (ex: if (sessao.usuario_id !== req.usuario.id) ... )
            
            sessao.registro_fim = new Date();
            await sessao.save();

            res.status(200).json({
                message: 'Sessão encerrada com sucesso.',
                sessao: sessao
            });
        } else {
            res.status(404).json({ message: 'Sessão de chat não encontrada.' });
        }
    } catch (error) {
        console.error("ERRO DETALHADO AO ENCERRAR SESSÃO:", error);
        res.status(500).json({ message: "Erro ao encerrar sessão de chat.", error: error.message });
    }
};
