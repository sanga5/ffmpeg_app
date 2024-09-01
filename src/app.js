const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for session management
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Hard-coded users
const users = {
  user1: { username: 'user1', password: 'password1', uploadDir: 'uploads/user1' },
  user2: { username: 'user2', password: 'password2', uploadDir: 'uploads/user2' }
};

// Ensure upload directories exist
Object.values(users).forEach(user => {
  if (!fs.existsSync(user.uploadDir)) {
    fs.mkdirSync(user.uploadDir, { recursive: true });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Serve login.html as the default file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (user && user.password === password) {
    req.session.user = user;
    res.redirect('/upload');
  } else {
    res.send('Invalid username or password');
  }
});

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
}

// Serve upload.html for authenticated users
app.get('/upload', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'upload.html'));
});

// Serve convert.html for authenticated users
app.get('/convert', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'convert.html'));
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, req.session.user.uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Upload route
app.post('/api/upload', isAuthenticated, upload.single('file'), (req, res) => {
  res.redirect('/convert');

});

// List files route
app.get('/api/files-list', isAuthenticated, (req, res) => {
  fs.readdir(req.session.user.uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to list files');
    }
    res.json(files);
  });
});

// Convert route
app.post('/api/convert', isAuthenticated, (req, res) => {
  const { file, format } = req.body;
  if (!file || !format) {
    return res.status(400).json({ error: 'File and format are required' });
  }

  const userDir = req.session.user.uploadDir;
  const filePath = path.join(userDir, file);
  const outputFilePath = path.join(userDir, `${path.parse(file).name}.${format}`);
  
  // Use ffmpeg to convert the file
  ffmpeg(filePath)
    .toFormat(format)
    .save(outputFilePath)
    .on('end', () => {
      console.log('Conversion successful:', outputFilePath); // Debugging line
      res.json({ message: 'File converted successfully', outputFile: outputFilePath });
    })
    .on('error', (err) => {
      console.error('Error during conversion:', err); // Debugging line
      res.status(500).json({ error: 'Error converting file', details: err.message });
    });


});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;