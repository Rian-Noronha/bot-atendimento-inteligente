const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login (já existente)
router.post('/login', authController.login);

// --- NOVAS ROTAS PARA RECUPERAÇÃO DE SENHA ---

// Rota para o usuário solicitar o link de recuperação
router.post('/esqueci-senha', authController.esqueciSenha);

// Rota para o usuário submeter o token e a nova senha
router.post('/redefinir-senha', authController.redefinirSenha);

module.exports = router;