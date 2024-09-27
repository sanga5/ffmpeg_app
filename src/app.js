const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const Cognito = require('@aws-sdk/client-cognito-identity-provider');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const { S3Client, PutObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');
const app = express();
const s3 = new S3Client({ region: 'ap-southeast-2' });

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware for session management
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// // Ensure upload directories exist
// Object.values(users).forEach(user => {
//   if (!fs.existsSync(user.uploadDir)) {
//     fs.mkdirSync(user.uploadDir, { recursive: true });
//   }
// });


const userPoolId = "ap-southeast-2_ze3iU7nm8"; // Obtain from AWS console
const clientId = "d8ng8gora28qtlghnn5g3m1kj"; // match signUp.js
const region = "ap-southeast-2";

// Initialize Cognito client
const cognitoClient = new Cognito.CognitoIdentityProviderClient({ region });

const idVerifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: 'id',
  clientId,
});

const accessVerifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: 'access',
  clientId,
});

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

// Serve signup.html as the default file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

// Redirect to login page
app.post('/loginPage', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;

  const command = new Cognito.SignUpCommand({
    ClientId: clientId,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  });

  try {
    const cognitoResponse = await cognitoClient.send(command);
    res.send('Signup successful, please check your email for the confirmation code');
  } catch (err) {
    console.log(err);
    res.send('Error signing up');
  }
});

// Confirm email route
app.post('/confirm', async (req, res) => {
  const { username, code } = req.body;

  const command = new Cognito.ConfirmSignUpCommand({
    ClientId: clientId,
    Username: username,
    ConfirmationCode: code,
  });

  try {
    const cognitoResponse = await cognitoClient.send(command);
    res.send('Email confirmed, you can now login');
  } catch (err) {
    console.log(err);
    res.send('Error confirming email');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const command = new Cognito.InitiateAuthCommand({
    AuthFlow: Cognito.AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  });

  try {
    const response = await cognitoClient.send(command);
    console.log(response);

    // ID Tokens are used to authenticate users to your application
    const IdToken = response.AuthenticationResult.IdToken;
    const IdTokenVerifyResult = await idVerifier.verify(IdToken);
    console.log(IdTokenVerifyResult);

    // Access tokens are used to link IAM roles to identities for accessing AWS services
    const accessToken = response.AuthenticationResult.AccessToken;
    const accessTokenVerifyResult = await accessVerifier.verify(accessToken);
    console.log(accessTokenVerifyResult);

    // Set the ID token as a cookie
    res.cookie('idToken', IdToken, { httpOnly: true });

    // Redirect to the upload page
    res.redirect('/upload');
  } catch (err) {
    console.log(err);
    res.send('Invalid username or password');
  }
});

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.cookies.idToken) {
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});