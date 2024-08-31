const path = require('path');
const fs = require('fs');

// Handle file uploads
exports.uploadFile = (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Not logged in');
    }

    // Ensure the user's directory exists
    const userDir = path.join(__dirname, '../uploads', req.session.user);
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }

    // Construct the file path
    const filePath = path.join(userDir, req.file.originalname);

    // Save the file
    fs.writeFile(filePath, req.file.buffer, (err) => {
        if (err) {
            return res.status(500).send('Failed to save file');
        }

        res.redirect('/upload');
    });
};
