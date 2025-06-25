const express = require('express');
const router = express.Router();
const palavraChaveController = require('../controllers/palavraChaveController');


router.get('/palavras-chave', palavraChaveController.pegarTodasPalavrasChave);
router.get('/palavras-chave/:id', palavraChaveController.pegarPalavraChavePorId);
router.post('/palavras-chave', palavraChaveController.criarPalavraChave);
router.put('/palavras-chave/:id', palavraChaveController.atualizarPalavraChave);
router.delete('/palavras-chave/:id', palavraChaveController.deletarPalavraChave);

module.exports = router;