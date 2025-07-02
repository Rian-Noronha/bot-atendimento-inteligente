const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentoController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/documentos', protect, isAdmin, documentosController.pegarTodosDocumentos);
router.get('/documentos/:id', protect, isAdmin, documentosController.pegarDocumentoPorId);
router.post('/documentos', protect, isAdmin, documentosController.criarDocumento);
router.put('/documentos/:id', protect, isAdmin, documentosController.atualizarDocumento);
router.delete('/documentos/:id', protect, isAdmin, documentosController.deletarDocumento);

module.exports = router;