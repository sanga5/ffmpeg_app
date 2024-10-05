require('dotenv').config();
const Cognito = require("@aws-sdk/client-cognito-identity-provider");
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const { PassThrough } = require('stream');
const { Upload } = require('@aws-sdk/lib-storage');
const { v4: uuidv4 } = require('uuid');
const { logFileForUser } = require('./index');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const multer = require('multer');
const multerS3 = require('multer-s3');
const ffmpeg = require('fluent-ffmpeg');
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command} = require('@aws-sdk/client-s3');
const app = express();
const s3 = new S3Client({ region: 'ap-southeast-2' });
const { createBucket, tagBucket, writeObject, readObject, generatePresignedUrl } = require('./s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const qutUsername = 'n11611553@qut.edu.au';

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

    // Redirect to the main page
    res.redirect('/main');
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

// Serve main.html for authenticated users
app.get('/main', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

// Serve upload.html for authenticated users
app.get('/upload', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'upload.html'));
});

// Serve convert.html for authenticated users
app.get('/convert', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'convert.html'));
});


// Configure multer to use S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'n11611553-test',
    key: async (req, file, cb) => {
      const idToken = req.cookies.idToken;
      const decodedToken = await idVerifier.verify(idToken);
      const qutUsername = decodedToken['cognito:username'];
      const userFolder = `${qutUsername}/`;
      cb(null, `${userFolder}${file.originalname}`);
    },
  }),
});


// Upload route
  app.post('/api/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  const idToken = req.cookies.idToken;
  const file = req.file;

  try {
    const decodedToken = await idVerifier.verify(idToken);
    //const cognitoUsername = decodedToken['cognito:username'];

    await logFileForUser(qutUsername, file.originalname);
    res.redirect('/convert');
  } catch (err) {
    console.log(err);
    res.send('Error uploading and logging file');
  }

 });

// List files route
app.get('/api/files-list', isAuthenticated, async (req, res) => {
  try {
    const decodedToken = await idVerifier.verify(req.cookies.idToken);
    const qutUsername = decodedToken['cognito:username']; 
    const userFolder = `${qutUsername}/`;

    const listParams = {
      Bucket: 'n11611553-test',
      Prefix: userFolder,
    };

    const command = new ListObjectsV2Command(listParams);
    const data = await s3.send(command);
    const files = data.Contents.map(item => item.Key);
    res.json(files);
  } catch (err) {
    res.status(500).send('Unable to list files');
  }
});



// Convert route
app.post('/api/convert', isAuthenticated, async (req, res) => {
  const idToken = req.cookies.idToken;
  const decodedToken = await idVerifier.verify(idToken);
  const userFolder = `${decodedToken['cognito:username']}/`;

  const { file, format } = req.body;
  if (!file || !format) {
    return res.status(400).json({ error: 'File and format are required' });
  }
  const bucketName = 'n11611553-test';
  const localInputPath = `/tmp/${uuidv4()}-${path.basename(file)}`;
  const localOutputPath = `/tmp/${uuidv4()}.${format}`;
  const outputKey = `${userFolder}${path.parse(file).name}.${format}`;

  try {
    // Download the file from S3 to the local disk
    const getObjectParams = {
      Bucket: bucketName,
      Key: file,
    };
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const data = await s3.send(getObjectCommand);

    // Write the file to the local disk
    const writeStream = fs.createWriteStream(localInputPath);
    data.Body.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    

    // Convert the file using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(localInputPath)
        .output(localOutputPath)
        .on('start', commandLine => {
          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('progress', progress => {
          console.log('Processing: ' + (progress.percent || 0).toFixed(2) + '% done');
        })
        .on('error', (err, stdout, stderr) => {
          console.error('Error during conversion:', err.message);
          console.error('ffmpeg stdout:', stdout);
          console.error('ffmpeg stderr:', stderr);
          reject(err);
        })
        .on('end', resolve)
        .run();
    });

    // Upload the converted file back to S3
    const fileStream = fs.createReadStream(localOutputPath);
    const putObjectParams = {
      Bucket: bucketName,
      Key: outputKey,
      Body: fileStream,
    };
    const putObjectCommand = new PutObjectCommand(putObjectParams);
    await s3.send(putObjectCommand);
    try {
      await logFileForUser(qutUsername, outputKey);
    } catch (err) {
      console.log(err);
    }

    // Delete the local files
    fs.unlinkSync(localInputPath);
    fs.unlinkSync(localOutputPath);

    res.json({ message: 'File converted successfully', outputFile: outputKey });
  } catch (err) {
    console.error('Error during conversion:', err);
    if (fs.existsSync(localInputPath)) fs.unlinkSync(localInputPath);
    if (fs.existsSync(localOutputPath)) fs.unlinkSync(localOutputPath);
    res.status(500).json({ error: 'Error converting file', details: err.message });
  }
});

// Download route
app.get('/api/download', isAuthenticated, async (req, res) => {
  const idToken = req.cookies.idToken;
  const decodedToken =  await idVerifier.verify(idToken);
  const { file } = req.query;
  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }

  const bucketName = 'n11611553-test';
  const key = file;
  const downloadStream = new PassThrough();

  const getObjectParams = {
    Bucket: bucketName,
    Key: key,
  };
  const getObjectCommand = new GetObjectCommand(getObjectParams);

  try {
    const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 }); // URL valid for 1 hour
    res.redirect( url );
  } catch (err) {
    console.error('Error generating pre-signed URL:', err);
    res.status(500).json({ error: 'Error generating pre-signed URL', details: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

