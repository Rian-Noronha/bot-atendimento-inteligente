const express = require('express');
const router = express.Router();
const assuntoPendenteController = require('../controllers/assuntoPendenteController');

router.get('/assuntos-pendentes', assuntoPendenteController.pegarAssuntosPendentes);
router.post('/assuntos-pendentes', assuntoPendenteController.criarAssuntoPendente);
router.put('/assuntos-pendentes/:id', assuntoPendenteController.atualizarStatusAssunto);
router.delete('/assuntos-pendentes/:id', assuntoPendenteController.deletarAssuntoPendente);


module.exports = router;
