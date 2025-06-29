// Importa os models necessários
const { Usuario, Perfil } = require('../models');

/**
 * Lista todos os usuários e inclui a informação do seu perfil.
 */
exports.pegarTodosUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['senha_hash'] }, // Nunca expor o hash da senha
            include: [{
                model: Perfil,
                as: 'perfil',
                attributes: ['id', 'nome']
            }],
            order: [['nome', 'ASC']]
        });
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar usuários", error: error.message });
    }
};

/**
 * Busca um único usuário pelo ID, também incluindo o perfil.
 */
exports.pegarUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ['senha_hash'] },
            include: [{ model: Perfil, as: 'perfil', attributes: ['id', 'nome'] }]
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

/**
 * Cria um novo usuário. A senha é criptografada automaticamente pelo hook do model.
 */
exports.criarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, perfil_id } = req.body;
        if (!nome || !email || !senha || !perfil_id) {
            return res.status(400).json({ message: "Todos os campos (nome, email, senha, perfil_id) são obrigatórios." });
        }

        // AGORA, O PROCESSO É MAIS SIMPLES:
        // 1. Passamos a senha em texto plano para o campo 'senha_hash'.
        // 2. O hook 'beforeCreate' no model do Usuario irá intercetar este valor,
        //    encriptá-lo e salvá-lo corretamente na base de dados.
        const novoUsuario = await Usuario.create({
            nome,
            email,
            senha_hash: senha, // O hook tratará de encriptar este valor
            perfil_id,
            ativo: true
        });

        // Retorna o usuário criado (sem a senha, claro)
        const { senha_hash: _, ...usuarioSemSenha } = novoUsuario.toJSON();
        res.status(201).json(usuarioSemSenha);

    } catch (error) {
        // Trata erros de validação, como o de email duplicado
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Este email já está em uso.' });
        }
        res.status(500).json({ message: "Erro ao criar usuário", error: error.message });
    }
};

/**
 * Atualiza um usuário existente.
 */
exports.atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        // Nota: Esta função não atualiza a senha. Seria necessário um tratamento adicional.
        const { nome, email, perfil_id, ativo } = req.body;

        const dadosParaAtualizar = { nome, email, perfil_id, ativo };

        const [numLinhasAtualizadas] = await Usuario.update(dadosParaAtualizar, {
            where: { id: id }
        });

        if (numLinhasAtualizadas > 0) {
            const usuarioAtualizado = await Usuario.findByPk(id, {
                attributes: { exclude: ['senha_hash'] },
                include: [{ model: Perfil, as: 'perfil'}]
            });
            res.status(200).json(usuarioAtualizado);
        } else {
            res.status(404).json({ message: "Usuário não encontrado ou dados são os mesmos." });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar usuário", error: error.message });
    }
};

/**
 * Deleta um usuário.
 */
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
