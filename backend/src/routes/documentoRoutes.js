const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentoController');

router.get('/documentos', documentosController.pegarTodosDocumentos);
router.get('/documentos/:id', documentosController.pegarDocumentoPorId); 
router.post('/documentos', documentosController.criarDocumento);
router.put('/documentos/:id', documentosController.atualizarDocumento);
router.delete('/documentos/:id', documentosController.deletarDocumento);

module.exports = router;
