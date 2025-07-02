const express = require('express');
const router = express.Router();
const palavraChaveController = require('../controllers/palavraChaveController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/palavras-chave', protect, isAdmin, palavraChaveController.pegarTodasPalavrasChave);
router.get('/palavras-chave/:id', protect, isAdmin, palavraChaveController.pegarPalavraChavePorId);
router.post('/palavras-chave', protect, isAdmin, palavraChaveController.criarPalavraChave);
router.put('/palavras-chave/:id', protect, isAdmin, palavraChaveController.atualizarPalavraChave);
router.delete('/palavras-chave/:id', protect, isAdmin, palavraChaveController.deletarPalavraChave);
router.post('/palavras-chave/lote', protect, isAdmin, palavraChaveController.encontrarOuCriarLote);

module.exports = router;