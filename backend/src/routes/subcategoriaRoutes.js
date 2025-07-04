const express = require('express');
const router = express.Router();
const subcategoriaController = require('../controllers/subcategoriaController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// --- ROTAS DE LEITURA (para todos os usuários logados) ---
router.get('/subcategorias/por-categoria/:categoriaId', protect, subcategoriaController.pegarSubcategoriasPorCategoria);
router.get('/subcategorias', protect, subcategoriaController.pegarTodasSubcategorias);
router.get('/subcategorias/:id', protect, subcategoriaController.pegarSubcategoriaPorId);

// --- ROTAS DE ESCRITA (apenas para Admins) ---
router.post('/subcategorias', protect, isAdmin, subcategoriaController.criarSubcategoria);
router.put('/subcategorias/:id', protect, isAdmin, subcategoriaController.atualizarSubcategoria);
router.delete('/subcategorias/:id', protect, isAdmin, subcategoriaController.deletarSubcategoria);

module.exports = router;