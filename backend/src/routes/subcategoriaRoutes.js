const express = require('express');
const router = express.Router();

const subcategoriaController = require('../controllers/subcategoriaController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// --- ROTAS DE LEITURA ---
router.get('/por-categoria/:categoriaId', protect, subcategoriaController.pegarSubcategoriasPorCategoria);
router.get('/', protect, subcategoriaController.pegarTodasSubcategorias);
router.get('/:id', protect, subcategoriaController.pegarSubcategoriaPorId);


// --- ROTAS DE ESCRITA (apenas para Admins) ---
router.post('/', protect, isAdmin, subcategoriaController.criarSubcategoria);
router.put('/:id', protect, isAdmin, subcategoriaController.atualizarSubcategoria);


router.delete('/:id', protect, isAdmin, subcategoriaController.deletarSubcategoria);

module.exports = router;