const express = require('express');
const router = express.Router();
const subcategoriaController = require('../controllers/subcategoriaController');

// Rota para buscar todas as subcategorias de uma categoria específica
// Ex: GET /api/subcategorias/por-categoria/2
router.get('/subcategorias/por-categoria/:categoriaId', subcategoriaController.pegarSubcategoriasPorCategoria);

// Suas rotas existentes
router.get('/subcategorias', subcategoriaController.pegarTodasSubcategorias);
router.get('/subcategorias/:id', subcategoriaController.pegarSubcategoriaPorId);
router.post('/subcategorias', subcategoriaController.criarSubcategoria);
router.put('/subcategorias/:id', subcategoriaController.atualizarSubcategoria);
router.delete('/subcategorias/:id', subcategoriaController.deletarSubcategoria);

module.exports = router;
