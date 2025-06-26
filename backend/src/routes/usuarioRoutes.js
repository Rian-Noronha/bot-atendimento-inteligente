const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.get('/usuarios', usuarioController.pegarTodosUsuarios);
router.get('/usuarios/:id', usuarioController.pegarUsuarioPorId);
router.post('/usuarios', usuarioController.criarUsuario);
router.put('/usuarios/:id', usuarioController.atualizarUsuario);
router.delete('/usuarios/:id', usuarioController.deletarUsuario);


module.exports = router;
