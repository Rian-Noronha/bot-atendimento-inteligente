const express = require('express');
const router = express.Router();
const chatSessaoController = require('../controllers/chatSessaoController');

router.post('/sessoes/iniciar', chatSessaoController.iniciarSessao);
router.put('/sessoes/encerrar/:id', chatSessaoController.encerrarSessao);

module.exports = router;
