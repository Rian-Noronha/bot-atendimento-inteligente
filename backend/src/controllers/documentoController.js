// Importamos todos os models necessários e o sequelize para transações
const { Documento, Subcategoria, Categoria, PalavraChave, sequelize } = require('../models');

/**
 * @description Lista todos os documentos, incluindo suas subcategorias, categorias e palavras-chave associadas.
 */
exports.pegarTodosDocumentos = async (req, res) => {
    try {
        const documentos = await Documento.findAll({
            include: [
                {
                    model: Subcategoria,
                    as: 'subcategoria',
                    attributes: ['nome'],
                    include: [{
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['nome']
                    }]
                },
                {
                    model: PalavraChave,
                    as: 'palavrasChave',
                    attributes: ['id', 'palavra'],
                    through: { attributes: [] }
                }
            ],
            order: [['id', 'DESC']]
        });
        res.status(200).json(documentos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar documentos", error: error.message });
    }
};

/**
 * @description Busca um documento específico por ID, incluindo suas associações.
 */
exports.pegarDocumentoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findByPk(id, {
            include: [
                {
                    model: Subcategoria,
                    as: 'subcategoria',
                    attributes: ['nome'],
                    include: [{
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['nome']
                    }]
                },
                {
                    model: PalavraChave,
                    as: 'palavrasChave',
                    attributes: ['id', 'palavra'],
                    through: { attributes: [] }
                }
            ]
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

/**
 * @description Cria um novo documento e o associa com as palavras-chave fornecidas.
 */
exports.criarDocumento = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { titulo, descricao, solucao, subcategoria_id, palavrasChaveIds, ativo, urlArquivo, tipo_documento } = req.body;

        if (!titulo || !solucao || !subcategoria_id) {
            await t.rollback();
            return res.status(400).json({ message: "Título, solução e ID da subcategoria são obrigatórios." });
        }

        const novoDocumento = await Documento.create({
            titulo,
            descricao,
            solucao,
            ativo: ativo !== undefined ? ativo : true,
            urlArquivo,
            tipo_documento, // Corrigido de tipoDocumento para tipo_documento para corresponder ao seu JSON
            subcategoria_id
        }, { transaction: t });

        if (palavrasChaveIds && Array.isArray(palavrasChaveIds) && palavrasChaveIds.length > 0) {
            // CORREÇÃO: O método é 'addPalavrasChave', baseado no alias 'palavrasChave'.
            await novoDocumento.addPalavrasChave(palavrasChaveIds, { transaction: t });
        }

        await t.commit();
        
        const resultadoFinal = await Documento.findByPk(novoDocumento.id, {
            include: [
                { model: Subcategoria, as: 'subcategoria' },
                { model: PalavraChave, as: 'palavrasChave', through: { attributes: [] } }
            ]
        });

        res.status(201).json(resultadoFinal);

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: "Erro ao criar documento.", error: error.message });
    }
};

/**
 * @description Atualiza um documento existente e suas palavras-chave associadas.
 */
exports.atualizarDocumento = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { palavrasChaveIds, ...dadosDocumento } = req.body;

        const documento = await Documento.findByPk(id);
        if (!documento) {
            await t.rollback();
            return res.status(404).json({ message: 'Documento não encontrado.' });
        }
        
        await documento.update(dadosDocumento, { transaction: t });

        if (palavrasChaveIds && Array.isArray(palavrasChaveIds)) {
             // CORREÇÃO: O método é 'setPalavrasChave', baseado no alias 'palavrasChave'.
             await documento.setPalavrasChave(palavrasChaveIds, { transaction: t });
        }

        await t.commit();
        
        const documentoAtualizado = await Documento.findByPk(id, {
            include: [
                { model: Subcategoria, as: 'subcategoria' },
                { model: PalavraChave, as: 'palavrasChave', through: { attributes: [] } }
            ]
        });

        res.status(200).json(documentoAtualizado);

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: "Erro ao atualizar documento.", error: error.message });
    }
};

/**
 * @description Deleta um documento.
 */
exports.deletarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const deletado = await Documento.destroy({
            where: { id: id }
        });

        if (deletado) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Documento não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar documento.", error: error.message });
    }
};
