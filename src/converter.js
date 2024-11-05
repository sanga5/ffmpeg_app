// converter.js

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { logFileForUser } = require('./index'); // Ensure the path is correct
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const pipeline = promisify(require('stream').pipeline);

// Configuration
const REGION = 'ap-southeast-2';
const S3_BUCKET = 'n11611553-test';
const QUEUE_URL = 'https://sqs.ap-southeast-2.amazonaws.com/901444280953/VideoConverterQ';

// Initialize AWS Clients
const s3 = new S3Client({ region: REGION });
const sqs = new SQSClient({ region: REGION });

// Function to download a file from S3
const downloadFile = async (bucket, key, downloadPath) => {
  const getObjectParams = {
    Bucket: bucket,
    Key: key,
  };
  const command = new GetObjectCommand(getObjectParams);
  const data = await s3.send(command);
  await pipeline(data.Body, fs.createWriteStream(downloadPath));
};

// Function to upload a file to S3
const uploadFile = async (bucket, key, filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const putObjectParams = {
    Bucket: bucket,
    Key: key,
    Body: fileStream,
  };
  const command = new PutObjectCommand(putObjectParams);
  await s3.send(command);
};

// Function to process a single SQS message
const processMessage = async (message) => {
  const { username, filename, bucket, format } = JSON.parse(message.Body);
  
  // Validate format
  const validFormats = ['mp4', 'avi', 'mov', 'mkv']; // Add more formats as needed
  const outputFormat = (format && validFormats.includes(format)) ? format : 'mp4';  
  const localInputPath = `/tmp/${uuidv4()}-${path.basename(filename)}`;
  const localOutputPath = `/tmp/converted-${uuidv4()}-${path.basename(filename, path.extname(filename))}.${outputFormat}`;
  const outputKey = `${username}${path.parse(filename).name}.${outputFormat}`;
    try {
    console.log(`Processing file: ${filename} for user: ${username}`);

    // Download the file from S3
    await downloadFile(bucket, filename, localInputPath);
    console.log(`Downloaded ${filename} to ${localInputPath}`);

    // Convert the file using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(localInputPath)
        .output(localOutputPath)
        .on('end', () => {
          console.log(`Conversion completed: ${localOutputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Error during conversion: ${err.message}`);
          reject(err);
        })
        .run();
    });

    // Upload the converted file back to S3
    await uploadFile(bucket, outputKey, localOutputPath);
    console.log(`Uploaded converted file to ${outputKey}`);

    // Log the file conversion in DynamoDB
    await logFileForUser('n11611553@qut.edu.au', outputKey);
    console.log(`Logged conversion for user: ${username}, file: ${outputKey}`);

    // Clean up local files
    fs.unlinkSync(localInputPath);
    fs.unlinkSync(localOutputPath);
    console.log(`Cleaned up local files: ${localInputPath}, ${localOutputPath}`);

    // Delete the message from SQS
    const deleteParams = {
      QueueUrl: QUEUE_URL,
      ReceiptHandle: message.ReceiptHandle,
    };
    const deleteCommand = new DeleteMessageCommand(deleteParams);
    await sqs.send(deleteCommand);
    console.log(`Deleted message from SQS: ${message.MessageId}`);
  } catch (err) {
    console.error(`Failed to process message ${message.MessageId}: ${err.message}`);
    // Optionally, implement retry logic or move the message to a Dead-Letter Queue (DLQ)
  }
};

// Polling function to continuously check for new messages in SQS
const pollQueue = async () => {
  const receiveParams = {
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20, // Long polling
    VisibilityTimeout: 60, // Time to process the message
  };

  try {
    const receiveCommand = new ReceiveMessageCommand(receiveParams);
    const data = await sqs.send(receiveCommand);

    if (data.Messages) {
      for (const message of data.Messages) {
        await processMessage(message);
      }
    }
  } catch (err) {
    console.error(`Error receiving messages: ${err.message}`);
  } finally {
    // Continue polling
    setTimeout(pollQueue, 1000);
  }
};

// Start polling the SQS queue
pollQueue();