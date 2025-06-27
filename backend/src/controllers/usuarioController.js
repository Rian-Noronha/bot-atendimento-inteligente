// Importa os models necessários, incluindo o Perfil para as associações
const { Usuario, Perfil } = require('../models');
const bcrypt = require('bcrypt');

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
                attributes: ['id', 'nome'] // Inclui o ID e o nome do perfil
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
 * Cria um novo usuário com senha criptografada.
 */
exports.criarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, perfil_id } = req.body;
        if (!nome || !email || !senha || !perfil_id) {
            return res.status(400).json({ message: "Todos os campos (nome, email, senha, perfil_id) são obrigatórios." });
        }

        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha, salt);

        const novoUsuario = await Usuario.create({ nome, email, senha_hash, perfil_id, ativo: true });

        const { senha_hash: _, ...usuarioSemSenha } = novoUsuario.toJSON();
        res.status(201).json(usuarioSemSenha);

    } catch (error) {
        res.status(500).json({ message: "Erro ao criar usuário", error: error.message });
    }
};

/**
 * Atualiza um usuário existente.
 * CORRIGIDO: Esta versão garante que o perfil_id seja processado corretamente.
 */
exports.atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, perfil_id, ativo } = req.body;

        // 1. Cria um objeto apenas com os dados que queremos atualizar
        const dadosParaAtualizar = {
            nome,
            email,
            perfil_id,
            ativo
        };
        
        // Adiciona um log para vermos exatamente o que o servidor está a receber
        console.log(`Atualizando usuário ID ${id} com os dados:`, dadosParaAtualizar);

        // 2. Executa o update com os dados explícitos
        const [numLinhasAtualizadas] = await Usuario.update(dadosParaAtualizar, {
            where: { id: id }
        });

        // 3. Verifica se alguma linha foi de facto atualizada
        if (numLinhasAtualizadas > 0) {
            // Busca o utilizador atualizado com o seu novo perfil para devolver a resposta
            const usuarioAtualizado = await Usuario.findByPk(id, {
                include: [{ model: Perfil, as: 'perfil', attributes: ['nome'] }]
            });
            res.status(200).json(usuarioAtualizado);
        } else {
            res.status(404).json({ message: "Usuário não encontrado ou dados são os mesmos." });
        }
    } catch (error) {
        // Adiciona um log de erro mais detalhado no servidor
        console.error("ERRO AO ATUALIZAR USUÁRIO:", error);
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
