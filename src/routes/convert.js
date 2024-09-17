const express = require('express');
const router = express.Router();
const multer = require('../middleware/upload');
const convertController = require('../controllers/convertController');

router.post('/', multer.single('file'), convertController.convertVideo);

module.exports = router;