const {PalavrasChave} = require('../models');

    exports.pegarTodasPalavrasChave = async (req, res) => {
        try{
            const palavrasChave = await PalavrasChave.findAll();
            res.status(200).json(palavrasChave);
        }catch(error){
            res.status(500).json({message: 'Erro ao buscar palavras-chave.'});
        }
    };

    exports.pegarPalavraChavePorId = async (req, res) => {
        try{
            const {id} = req.params;
            const palavraChave = await PalavrasChave.findByPk(id);

            if(palavraChave){
                res.status(200).json(palavraChave);
            }else{
                res.status(404).json({message: 'Palavra-chave não encontrada.'});
            }
        }catch(error){
            res.status(500).json({message: 'Erro ao buscar palavra-chave.', error: error.message});
        }
    };


    exports.criarPalavraChave = async (req, res) => {
        try{
            const {palavra} = req.body;
            if(!palavra){
                return res.status(400).json({message: 'O campo palavra-chave é obrigatório.'});
            }

            const novaPalavraChave = await PalavrasChave.create({palavra});

            res.status(201).json(novaPalavraChave);

        }catch(error){
            res.status(500).json({message: 'Erro ao criar palavra-chave.', error: error.message});
        }
    };


    exports.atualizarPalavraChave = async (req, res) => {
        try{
            const {id} = req.params;
            const {palavra} = req.body;

            const [atualizada] = await PalavrasChave.update({palavra}, {
                where: {id: id}
            });

            if(atualizada){
                const palavraAtualizada = await PalavrasChave.findByPk(id);
                res.status(200).json(palavraAtualizada);
            }else{
                res.status(404).json({message: 'Palavra-chave não encontrada.'});
            }
        }catch(error){
            res.status(500).json({message: 'Erro ao atualizar palavra-chave.', error: error.message});
        }
    };


    exports.deletarPalavraChave = async (req, res) => {
        try{
            const {id} = req.params;
            const deletada = await PalavrasChave.destroy({
                where: {id: id}
            });

            if(deletada){
                res.status(204).send();
            }else{
                res.status(404).json({message: 'Palavra-chave não encontrada.'});
            }
        }catch(error){
            res.status(500).json({message: 'Erro ao deletar palavra-chave.', error: error.message});
        }
    };







