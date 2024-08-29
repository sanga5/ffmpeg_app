// src/routes/video.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

router.post('/', upload.single('file'), uploadController.uploadVideo);

module.exports = router;
