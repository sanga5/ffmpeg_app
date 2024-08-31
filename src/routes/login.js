const express = require('express');
const router = express.Router();

// POST route to handle login
router.post('/', (req, res) => {
    // Log the request body to check incoming data
    console.log('Request body:', req.body);

    const { username, password } = req.body;

    // Log the extracted values
    console.log('Username:', username);
    console.log('Password:', password);

    // Replace 'your-username' and 'your-password' with your desired credentials
    if (username === '1' && password === '2') {
        req.session.user = username; // Save user info in session
        res.redirect('/upload'); // Redirect to upload.html
    } else {
        res.status(401).send('Invalid credentials');
    }
});

module.exports = router;
