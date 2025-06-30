const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// 1. IMPORTE OS DOIS MIDDLEWARES
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware'); // Importe o novo middleware

// --- CORRIGINDO E ORGANIZANDO SUAS ROTAS ---

// Rota para administradores verem todos os usuários
router.get('/usuarios', protect, isAdmin, usuarioController.pegarTodosUsuarios);

// Rota para administradores verem um usuário específico
router.get('/usuarios/:id', protect, isAdmin, usuarioController.pegarUsuarioPorId);

// Rota para administradores criarem novos usuários
router.post('/usuarios', protect, isAdmin, usuarioController.criarUsuario);

// Rota para administradores atualizarem usuários
router.put('/usuarios/:id', protect, isAdmin, usuarioController.atualizarUsuario);

// Rota para administradores deletarem usuários
router.delete('/usuarios/:id', protect, isAdmin, usuarioController.deletarUsuario);

module.exports = router;