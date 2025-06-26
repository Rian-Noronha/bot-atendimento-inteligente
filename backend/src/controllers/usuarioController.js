const { Usuario, Perfil } = require('../models');
const bcrypt = require('bcrypt');

//listar todos os usuários junto ao seu perfil
exports.pegarTodosUsuarios = async (req, res) => {
    try {
       
        const usuarios = await Usuario.findAll({
            include: [{
                model: Perfil,
                as: 'perfil', // Usa o 'as' definido na associação do model
                attributes: ['nome'] // Pega apenas o campo 'nome' do perfil
            }]
        });
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar usuários", error: error.message });
    }
};

//listar um usuário via seu id juntando-o ao seu perfil
exports.pegarUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id, {
            include: [{ model: Perfil, as: 'perfil', attributes: ['nome'] }]
        });

        if (usuario) {
            res.status(200).json(usuario);
        } else {
            res.status(404).json({ message: "Usuário não encontrado." });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar usuário", error: error.message });
    }
};

//criando um novo usuário com sua senha hash
exports.criarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, perfil_id } = req.body;
        if (!nome || !email || !senha || !perfil_id) {
            return res.status(400).json({ message: "Todos os campos (nome, email, senha, perfil_id) são obrigatórios." });
        }

        // Criptografa a senha antes de salvar
        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha, salt);

        const novoUsuario = await Usuario.create({
            nome,
            email,
            senha_hash, // Salva a senha criptografada
            perfil_id,
            ativo: true // Define como ativo por padrão
        });

        // Não retorna a senha no response
        const { senha_hash: _, ...usuarioSemSenha } = novoUsuario.toJSON();
        res.status(201).json(usuarioSemSenha);

    } catch (error) {
        res.status(500).json({ message: "Erro ao criar usuário", error: error.message });
    }
};

//atualizando usuário, sua senha deve atualizada com um controller específico
exports.atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, perfil_id, ativo } = req.body;

        const [updated] = await Usuario.update({ nome, email, perfil_id, ativo }, {
            where: { id: id }
        });

        if (updated) {
            const usuarioAtualizado = await Usuario.findByPk(id);
            res.status(200).json(usuarioAtualizado);
        } else {
            res.status(404).json({ message: "Usuário não encontrado." });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar usuário", error: error.message });
    }
};


exports.deletarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Usuario.destroy({
            where: { id: id }
        });

        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Usuário não encontrado." });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar usuário", error: error.message });
    }
};
