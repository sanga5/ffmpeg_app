const fs = require('fs');
const path = require('path');

// Handle request to list files in the user's directory
exports.listFiles = (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Not logged in');
    }

    const userDir = path.join(__dirname, '../uploads', req.session.user);

    fs.readdir(userDir, (err, files) => {
        if (err) {
            return res.status(500).send('Failed to read directory');
        }

        res.json({ files });
    });
};
