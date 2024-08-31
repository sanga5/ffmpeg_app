const express = require('express');
const router = express.Router();
const filesListController = require('../controllers/filesListController');

router.get('/', filesListController.listFiles);

console.log('FilesListController:', filesListController);


module.exports = router;
