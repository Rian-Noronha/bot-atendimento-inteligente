const { Documento, Subcategoria, Categoria } = require('../models'); // Importamos todos os models necessários

    //listando todos todos os documentos pegando sua subcategoria que está vinculada à sua respectiva categoria
    exports.pegarTodosDocumentos = async (req, res) => {
        try {
            const documentos = await Documento.findAll({
                include: [{
                    model: Subcategoria,
                    as: 'subcategoria',
                    attributes: ['nome'], 
                    include: [{ // Um include dentro de outro
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['nome'] 
                    }]
                }],
                order: [['id', 'ASC']] //ordenar pelo id
            });
            res.status(200).json(documentos);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar documentos", error: error.message });
        }
    };

    exports.pegarDocumentoPorId = async (req, res) => {
        try {
            const { id } = req.params;
            const documento = await Documento.findByPk(id, {
                include: [{
                    model: Subcategoria,
                    as: 'subcategoria',
                    attributes: ['nome'],
                    include: [{
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['nome']
                    }]
                }]
            });

            if (documento) {
                res.status(200).json(documento);
            } else {
                res.status(404).json({ message: 'Documento não encontrado.' });
            }
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar documento", error: error.message });
        }
    };

    
    exports.criarDocumento = async (req, res) => {
        try {
            
            const { titulo, descricao, solucao, ativo, urlArquivo, tipoDocumento, subcategoria_id } = req.body;
            
            if (!validarCampos(titulo, descricao, solucao, subcategoria_id)) {
                return res.status(400).json({ message: "Título, descrição, solução e subcategoria_id são obrigatórios." });
            }

            const novoDocumento = await Documento.create({
                titulo,
                descricao,
                solucao,
                ativo: ativo !== undefined ? ativo : true, // Valor padrão para 'ativo'
                urlArquivo,
                tipoDocumento,
                subcategoria_id
            });
            res.status(201).json(novoDocumento);

        } catch (error) {
            res.status(500).json({ message: "Erro ao criar documento.", error: error.message });
        }
    };

  
    exports.atualizarDocumento = async (req, res) => {
        try {
            const { id } = req.params;
            const [updated] = await Documento.update(req.body, {
                where: { id: id }
            });

            if (updated) {
                const documentoAtualizado = await Documento.findByPk(id);
                res.status(200).json(documentoAtualizado);
            } else {
                res.status(404).json({ message: 'Documento não encontrado.' });
            }
        } catch (error) {
            res.status(500).json({ message: "Erro ao atualizar documento.", error: error.message });
        }
    };

    
    exports.deletarDocumento = async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Documento.destroy({
                where: { id: id }
            });

            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Documento não encontrado.' });
            }
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar documento.", error: error.message });
        }
    };

    function validarCampos(titulo, descricao, solucao, subcategoria_id){
        let validados = true;
        if(!titulo || !descricao || !solucao || !subcategoria_id){
            validados = false;
        }

        return validados;
    }
