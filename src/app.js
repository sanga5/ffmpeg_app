const express = require('express');
const path = require('path');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'upload.html'));
});


// Routes
app.use('/api/upload', require('./routes/video'));
app.use('/api/convert', require('./routes/convert'));
app.use('/api/files-list', require('./routes/filesList'));


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;