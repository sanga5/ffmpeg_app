const express = require('express');
const path = require('path');
const session = require('express-session');
const loginRouter = require('./routes/login');
const uploadRouter = require('./routes/upload');

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Default route to serve login.html
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../public/login.html');
  res.sendFile(filePath);
});

app.use('/login', loginRouter);
app.use('/api/upload', uploadRouter);

// Serve upload.html at /upload
app.get('/upload', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, '../public/upload.html'));
  } else {
    res.redirect('/');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
