const { Perfil } = require('../models');

    // --- Controllers ---

    exports.pegarTodosPerfis = async (req, res) => {
        try {
            const perfis = await Perfil.findAll();
            res.status(200).json(perfis);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar perfis', error: error.message });
        }
    };

    exports.criarPerfil = async (req, res) => {
        if (!validarAcessoAdmin(req.user.perfil)) {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem criar perfis.' });
        }

        try {
            const { nome, descricao } = req.body;
            if (!validarCampos(nome, descricao)) {
                return res.status(400).json({ message: 'Os campos nome e descrição são obrigatórios.' });
            }
            
            const novoPerfil = await Perfil.create({ nome, descricao });
            res.status(201).json(novoPerfil);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao criar perfil.', error: error.message });
        }
    };

    exports.atualizarPerfil = async (req, res) => { 
        if (!validarAcessoAdmin(req.user.perfil)) {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem editar perfis.' });
        }

        try {
            const { id } = req.params;
            const { nome, descricao } = req.body;

            const [atualizado] = await Perfil.update({ nome, descricao }, {
                where: { id: id }
            });

            if (atualizado) {
                const perfilAtualizado = await Perfil.findByPk(id);
                res.status(200).json(perfilAtualizado);
            } else {
                res.status(404).json({ message: 'Perfil não encontrado.' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao atualizar perfil.', error: error.message });
        }
    };

    exports.deletarPerfil = async (req, res) => {
        if (!validarAcessoAdmin(req.user.perfil)) {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem deletar perfis.' });
        }

        try {
            const { id } = req.params;
            const deletado = await Perfil.destroy({
                where: { id: id }
            });

            if (deletado) {
                res.status(204).send(); // Sucesso, sem corpo de resposta
            } else {
                res.status(404).json({ message: 'Perfil não encontrado.' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao deletar perfil.', error: error.message });
        }
    };


    //Funções de validação
    
    function validarCampos(nome, descricao) {
        let camposValidados = true;

        if (!nome || !descricao) {
            camposValidados = false;
        }

        return camposValidados;
    }

    function validarAcessoAdmin(perfil) {
        let acessoAdminValidado = true;

        if (perfil !== 'Administrador') {
            acessoAdminValidado = false;
        }

        return acessoAdminValidado;
    }