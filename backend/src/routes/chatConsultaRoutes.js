const express = require('express');
const router = express.Router();
const chatConsultaController = require('../controllers/chatConsultaController');


router.post('/consultas', chatConsultaController.criarConsulta);
router.get('/sessoes/:sessao_id/consultas', chatConsultaController.pegarConsultasPorSessao);


module.exports = router;
