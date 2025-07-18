const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// --- ROTAS DE LEITURA ---


router.get('/', protect, categoriaController.pegarTodasCategorias);


router.get('/:id', protect, categoriaController.pegarCategoriaPorId);


// --- ROTAS DE ESCRITA ---


router.post('/', protect, isAdmin, categoriaController.criarCategoria);
router.put('/:id', protect, isAdmin, categoriaController.atualizarCategoria);
router.delete('/:id', protect, isAdmin, categoriaController.deletarCategoria);

module.exports = router;