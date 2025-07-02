const express = require('express');
const router = express.Router();
const assuntoPendenteController = require('../controllers/assuntoPendenteController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');


router.get('/assuntos-pendentes', protect, isAdmin, assuntoPendenteController.pegarAssuntosPendentes);
router.post('/assuntos-pendentes', protect, isAdmin, assuntoPendenteController.criarAssuntoPendente);
router.put('/assuntos-pendentes/:id', protect, isAdmin, assuntoPendenteController.atualizarStatusAssunto);
router.delete('/assuntos-pendentes/:id', protect, isAdmin, assuntoPendenteController.deletarAssuntoPendente);


module.exports = router;
