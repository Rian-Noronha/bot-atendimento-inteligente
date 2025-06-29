const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Importa o nosso novo middleware de autenticação
const { protect } = require('../middleware/authMiddleware');

// --- ROTAS PROTEGIDAS ---
// O middleware 'protect' é adicionado antes da função do controller.
// Ele será executado primeiro. Se o utilizador não estiver autenticado,
// ele bloqueará a requisição e o controller nunca será chamado.

// GET /api/usuarios - Protegido, apenas utilizadores logados podem ver a lista
router.get('/usuarios', protect, usuarioController.pegarTodosUsuarios);

// GET /api/usuarios/:id - Protegido
router.get('/usuarios/:id', protect, usuarioController.pegarUsuarioPorId);

// PUT /api/usuarios/:id - Protegido
router.put('/usuarios/:id', protect, usuarioController.atualizarUsuario);

// DELETE /api/usuarios/:id - Protegido
router.delete('/usuarios/:id', protect, usuarioController.deletarUsuario);


// --- ROTAS PÚBLICAS (EXEMPLO) ---
// A rota para criar um novo utilizador pode ser pública,
// ou pode ser protegida e restrita apenas a administradores.
// Vamos deixá-la pública por enquanto.
router.post('/usuarios', usuarioController.criarUsuario);


module.exports = router;
