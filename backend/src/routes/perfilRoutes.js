const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

console.log('Conteúdo importado de perfilController:', perfilController);

router.get('/perfis', protect, isAdmin, perfilController.pegarTodosPerfis);
router.get('/perfis/:id', protect, isAdmin, perfilController.pegarPerfilPorId);
router.post('/perfis', protect, isAdmin, perfilController.criarPerfil);
router.put('/perfis/:id', protect, isAdmin, perfilController.atualizarPerfil);
router.delete('/perfis/:id', protect, isAdmin, perfilController.deletarPerfil);

module.exports = router;