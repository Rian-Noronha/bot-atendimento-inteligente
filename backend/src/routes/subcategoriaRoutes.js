const express = require('express');
const router = express.Router();
const subcategoriaController = require('../controllers/subcategoriaController');

router.get('/subcategorias', subcategoriaController.pegarTodasSubcategorias);
router.get('/subcategorias/:id', subcategoriaController.pegarSubcategoriaPorId);
router.post('/subcategorias', subcategoriaController.criarSubcategoria);
router.put('/subcategorias/:id', subcategoriaController.atualizarSubcategoria);
router.delete('/subcategorias/:id', subcategoriaController.deletarSubcategoria);

module.exports = router;
