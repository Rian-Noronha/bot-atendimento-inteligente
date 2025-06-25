const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.get('/categorias', categoriaController.pegarTodasCategorias);
router.get('/categorias/:id', categoriaController.pegarCategoriaPorId);
router.post('/categorias', categoriaController.criarCategoria);
router.put('/categorias/:id', categoriaController.atualizarCategoria);
router.delete('/categorias/:id', categoriaController.deletarCategoria);

module.exports = router;