const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentoController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');


router.get('/', protect, isAdmin, documentosController.pegarTodosDocumentos);
router.get('/:id', protect, isAdmin, documentosController.pegarDocumentoPorId);
router.post('/', protect, isAdmin, documentosController.criarDocumento);
router.put('/:id', protect, isAdmin, documentosController.atualizarDocumento);
router.delete('/:id', protect, isAdmin, documentosController.deletarDocumento);


router.post('/iniciar-processamento', protect, isAdmin, documentosController.iniciarProcessamentoAutomatico);
module.exports = router;