const { Usuario, Perfil, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { enviarEmailRecuperacao } = require('../services/emailService');

/**
 * @description Realiza o login do utilizador.
 */
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }
        const usuario = await Usuario.findOne({
            where: { email },
            include: [{ model: Perfil, as: 'perfil' }]
        });
        if (!usuario || !usuario.ativo) {
            return res.status(401).json({ message: "Credenciais inválidas ou usuário inativo." });
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }
        const payload = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: {
                id: usuario.perfil.id,
                nome: usuario.perfil.nome
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ token, usuario: payload });
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor durante o login.", error: error.message });
    }
};

// --- FUNÇÃO QUE ESTAVA FALTANDO ---
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