const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');


// Rota de login (já existente)
router.post('/login', authController.login);

// --- NOVAS ROTAS PARA RECUPERAÇÃO DE SENHA ---

// Rota para o usuário solicitar o link de recuperação
router.post('/esqueci-senha', authController.esqueciSenha);

// Rota para o usuário submeter o token e a nova senha
router.post('/redefinir-senha', authController.redefinirSenha);

router.post('/logout', protect, authController.logout);

router.get('/me', protect, authController.getMe); 

router.put('/update-password', protect, authController.updatePassword);

module.exports = router;