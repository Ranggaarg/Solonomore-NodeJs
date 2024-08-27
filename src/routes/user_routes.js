const express = require('express');
const UserController = require('../controller/user_controller');
const multer = require('multer');
const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});
router.get('/data/:username', UserController.getDataUser);

router.patch('/gender/:username', UserController.updateGenderData);

router.patch('/age/:username', UserController.updateAgeData);

router.patch('/updatePreference/:username', UserController.UpdateUserPreference);

router.post('/upload', upload.any(), UserController.uploadExcel);

router.post('/find', UserController.findSimilarPlayers);

module.exports = router;