const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// --- ROTAS DE LEITURA (para todos os usuários logados) ---
// Operadores precisam disso para usar o chat.
router.get('/categorias', protect, categoriaController.pegarTodasCategorias);
router.get('/categorias/:id', protect, categoriaController.pegarCategoriaPorId);

// --- ROTAS DE ESCRITA (apenas para Admins) ---
// Apenas Admins podem gerenciar as categorias.
router.post('/categorias', protect, isAdmin, categoriaController.criarCategoria);
router.put('/categorias/:id', protect, isAdmin, categoriaController.atualizarCategoria);
router.delete('/categorias/:id', protect, isAdmin, categoriaController.deletarCategoria);

module.exports = router;