const { Usuario, Perfil, SessaoAtiva, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { enviarEmailRecuperacao } = require('../services/emailService');

/**
 * @description Realiza o login, invalida sessões antigas e cria uma nova sessão ativa.
 */
exports.login = async (req, res) => {
    const t = await sequelize.transaction(); // Inicia uma transação para garantir a consistência

    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }

        // 1. Busca o usuário COM a senha E o perfil de uma só vez
        const usuario = await Usuario.scope('withPassword').findOne({
            where: { email },
            include: [{ model: Perfil, as: 'perfil' }]
        });

        // 2. Valida o usuário e a senha
        if (!usuario || !usuario.ativo || !(await bcrypt.compare(senha, usuario.senha_hash))) {
            await t.rollback(); // Desfaz a transação se a validação falhar
            return res.status(401).json({ message: "Credenciais inválidas ou usuário inativo." });
        }

        // --- LÓGICA DE SESSÃO ÚNICA (DENTRO DA TRANSAÇÃO) ---
        await SessaoAtiva.destroy({ where: { usuario_id: usuario.id }, transaction: t });
        const sessionId = uuidv4();
        await SessaoAtiva.create({ session_id: sessionId, usuario_id: usuario.id }, { transaction: t });
        
        // 3. Prepara o payload do token, já com todos os dados necessários
        const payload = {
            id: usuario.id,
            sessionId: sessionId,
            nome: usuario.nome,
            email: usuario.email,
            perfil: {
                id: usuario.perfil.id,
                nome: usuario.perfil.nome
            }
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        
        // Se tudo deu certo, confirma (commita) a transação
        await t.commit();
        
        res.status(200).json({ token, usuario: payload });

    } catch (error) {
        // Se qualquer erro ocorrer, desfaz todas as operações da transação
        await t.rollback();
        console.error("Erro detalhado no login:", error); // Loga o erro real no servidor
        res.status(500).json({ message: "Erro interno no servidor durante o login." });
    }
};

/**
 * @description Etapa 1 do fluxo de recuperação: Envia o e-mail com o token.
 */
exports.esqueciSenha = async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            // Por segurança, não informamos se o e-mail existe ou não.
            return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de recuperação será enviado.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        usuario.reset_password_expires = sequelize.literal("NOW() + INTERVAL '1 hour'");
        usuario.reset_password_token = resetToken;
        await usuario.save();

        await enviarEmailRecuperacao(usuario.email, resetToken);

        res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de recuperação será enviado.' });

    } catch (error) {
        console.error("Erro no processo de 'esqueci a senha':", error);
        res.status(500).json({ message: 'Erro no servidor ao processar a solicitação.' });
    }
};

/**
 * @description Etapa 2 do fluxo de recuperação: Redefine a senha.
 */
exports.redefinirSenha = async (req, res) => {
    try {
        const { token, senha } = req.body;
        if (!token || !senha) {
            return res.status(400).json({ message: 'O token e a nova senha são obrigatórios.' });
        }
        const usuario = await Usuario.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: { [Op.gt]: new Date() }
            }
        });
        if (!usuario) {
            return res.status(400).json({ message: 'Token de recuperação inválido ou já expirado.' });
        }
        usuario.senha_hash = senha;
        usuario.reset_password_token = null;
        usuario.reset_password_expires = null;
        await usuario.save();
        res.status(200).json({ message: 'Sua senha foi redefinida com sucesso!' });
    } catch (error) {
        console.error("Erro no processo de 'redefinir a senha':", error);
        res.status(500).json({ message: 'Erro no servidor ao redefinir a senha.' });
    }
};

/**
 * @description Realiza o logout do usuário, invalidando a sua sessão ativa no servidor.
 */
exports.logout = async (req, res) => {
    try {
        // O middleware 'protect' já validou o token e a sessão,
        // e colocou os dados do payload do token em req.user.
        const { sessionId } = req.user;

        // Apenas para garantir, verificamos se o sessionId veio no token.
        if (sessionId) {
            // Deleta a sessão ativa do banco de dados.
            // Isso efetivamente invalida o token do usuário no lado do servidor.
            await SessaoAtiva.destroy({ where: { session_id: sessionId } });
        }

        res.status(200).json({ message: 'Logout realizado com sucesso.' });

    } catch (error) {
        console.error("Erro ao realizar o logout:", error);
        res.status(500).json({ message: 'Erro ao realizar o logout.' });
    }
};



/**
 * @description Retorna os dados do usuário atualmente logado (identificado pelo token).
 */
exports.getMe = async (req, res) => {
    try {
        // O middleware 'protect' já validou o token e anexou os dados em req.user.
        // Nós só precisamos buscar os dados completos com o perfil para retornar.
        const usuario = await Usuario.findByPk(req.user.id, {
            include: [{ model: Perfil, as: 'perfil', attributes: ['nome'] }]
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        
        res.status(200).json(usuario);
        
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar dados do usuário." });
    }
};


/**
 * @description Atualiza a senha do usuário logado.
 */
exports.updatePassword = async (req, res) => { // Nome padronizado para updatePassword
    try {
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ message: 'A senha atual e a nova senha são obrigatórias.' });
        }

        // A linha que estava solta agora está no lugar certo
        const usuario = await Usuario.scope('withPassword').findByPk(req.user.id);

        if (!usuario || !usuario.senha_hash) {
            return res.status(500).json({ message: 'Não foi possível verificar as credenciais do usuário.' });
        }
        
        const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ message: 'A senha atual está incorreta.' });
        }
        
        usuario.senha_hash = novaSenha;
        await usuario.save();

        res.status(200).json({ message: 'Senha atualizada com sucesso!' });

    } catch (error) {
        console.error("Erro ao atualizar senha:", error);
        res.status(500).json({ message: 'Erro interno ao atualizar a senha.' });
    }
};