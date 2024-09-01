const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  const uploadsDir = path.join(__dirname, '../../uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading directory' });
    }
    res.json({ files });
  });
});

module.exports = router;