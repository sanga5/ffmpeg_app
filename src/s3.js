// s3.js
const { S3Client, CreateBucketCommand, PutBucketTaggingCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fetch = require('node-fetch');

const bucketName = 'n1234567-test'; // Change to your unique bucket name
const qutUsername = 'n1234567@qut.edu.au'; // Change to your username
const purpose = 'prac';
const objectKey = 'myAwesomeObjectKey';
const objectValue = 'This could be just about anything.';

const s3Client = new S3Client({ region: 'ap-southeast-2' });

async function createBucket() {
    const command = new CreateBucketCommand({ Bucket: bucketName });
    try {
        const response = await s3Client.send(command);
        console.log(response.Location);
    } catch (err) {
        if (err.name === 'BucketAlreadyOwnedByYou') {
            console.log('Bucket already exists.');
        } else {
            console.log(err);
            return;
        }
    }
}

async function tagBucket() {
    const command = new PutBucketTaggingCommand({
        Bucket: bucketName,
        Tagging: {
            TagSet: [
                { Key: 'qut-username', Value: qutUsername },
                { Key: 'purpose', Value: purpose }
            ]
        }
    });
    try {
        const response = await s3Client.send(command);
        console.log(response);
    } catch (err) {
        console.log(err);
    }
}

async function writeObject() {
    try {
        const response = await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            Body: objectValue
        }));
        console.log(response);
    } catch (err) {
        console.log(err);
    }
}

async function readObject() {
    try {
        const response = await s3Client.send(new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        }));
        const str = await response.Body.transformToString();
        console.log(str);
    } catch (err) {
        console.log(err);
    }
}

async function generatePresignedUrl() {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });
        const presignedURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        console.log('Pre-signed URL to get the object:');
        console.log(presignedURL);

        const response = await fetch(presignedURL);
        const object = await response.text();
        console.log('Object retrieved with pre-signed URL: ');
        console.log(object);
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    createBucket,
    tagBucket,
    writeObject,
    readObject,
    generatePresignedUrl
};