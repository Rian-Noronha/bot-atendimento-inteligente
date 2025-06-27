const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/feedbacks', feedbackController.criarFeedback);
router.get('/feedbacks', feedbackController.pegarTodosFeedbacks);


module.exports = router;
