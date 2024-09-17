const path = require('path');

exports.uploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = path.join(__dirname, '../uploads', req.file.originalname);

  if (req.query.redirect) {
    return res.redirect('/convert.html');
  }

  return res.status(200).json({ message: 'File uploaded successfully', file: req.file });
};