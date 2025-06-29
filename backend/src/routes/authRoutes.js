const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define a rota para o login.
// O frontend fará uma requisição POST para /api/login
router.post('/login', authController.login);

module.exports = router;
