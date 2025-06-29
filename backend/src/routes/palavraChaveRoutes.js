const express = require('express');
const router = express.Router();
const palavraChaveController = require('../controllers/palavraChaveController');

// --- ROTAS CRUD BÁSICAS ---

// Rota para buscar todas as palavras-chave
router.get('/palavras-chave', palavraChaveController.pegarTodasPalavrasChave);

// Rota para buscar uma palavra-chave específica por ID
router.get('/palavras-chave/:id', palavraChaveController.pegarPalavraChavePorId);

// Rota para criar UMA nova palavra-chave
router.post('/palavras-chave', palavraChaveController.criarPalavraChave);

// Rota para atualizar uma palavra-chave por ID
router.put('/palavras-chave/:id', palavraChaveController.atualizarPalavraChave);

// Rota para deletar uma palavra-chave por ID
router.delete('/palavras-chave/:id', palavraChaveController.deletarPalavraChave);


// --- ROTA OTIMIZADA PARA O FRONTEND ---

/**
 * @description [NOVO E ESSENCIAL] Rota para encontrar ou criar múltiplas palavras-chave em lote.
 * O frontend enviará um POST para esta rota com um array de strings.
 * @example POST /api/palavras-chave/lote
 * @body { "palavras": ["fraude", "segurança", "cartão"] }
 */
router.post('/palavras-chave/lote', palavraChaveController.encontrarOuCriarLote);


module.exports = router;
