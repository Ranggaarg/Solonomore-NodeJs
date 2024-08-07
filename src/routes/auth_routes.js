const express = require('express');
const AuthController = require('../controller/auth_controller');
const router = express.Router();

router.post('/register', AuthController.userRegist);

router.post('/login', AuthController.userLogin);

module.exports = router;