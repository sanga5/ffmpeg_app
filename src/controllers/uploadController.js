// src/controllers/uploadController.js
const path = require('path');

exports.uploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = path.join(__dirname, '../uploads', req.file.originalname);
  // For demonstration, we are not saving to file system here.

  return res.status(200).json({ message: 'File uploaded successfully', file: req.file });
};
