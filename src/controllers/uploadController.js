const path = require('path');

exports.uploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = path.join(__dirname, '../uploads', req.file.originalname);

  // Check if redirect parameter is present
  if (req.query.redirect) {
    return res.redirect('/convert.html'); // Redirect to the new HTML page
  }

  return res.status(200).json({ message: 'File uploaded successfully', file: req.file });
};