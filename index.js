const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const cors = require('cors')
const dotenv = require('dotenv')
const app = express();

dotenv.config()

app.use(cors({origin: "http://localhost:3000"}))


const BUCKET_NAME = "my-scca5-bucket"
const USER_KEY = process.env.IAM_USER_KEY
const USER_SECRET = process.env.IAM_USER_SECRET


// Configure AWS SDK
AWS.config.update({
  accessKeyId: USER_KEY,
  secretAccessKey: USER_SECRET,
  region: 'us-west-2',
});

// Configure multer middleware to handle file upload
const upload = multer({ dest: 'uploads/' });

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileContent = fs.readFileSync(req.file.path);
    const s3 = new AWS.S3();
    const params = {
      Bucket: BUCKET_NAME,
      Key: "files/" + req.file.originalname,
      Body: fileContent,
    };
    await s3.upload(params).promise();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Handle file deletion
app.delete('/file/:key', async (req, res) => {
  try {
    const s3 = new AWS.S3();
    const params = {
      Bucket: BUCKET_NAME,
      Key: "files/" + req.params.key,
    };
    await s3.deleteObject(params).promise();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Handle file listing
app.get('/files', async (req, res) => {
  try {
    const s3 = new AWS.S3();
    const params = {
      Bucket: BUCKET_NAME,
    };
    const data = await s3.listObjects(params).promise();
    const files = data.Contents.map((file) => ({
      key: "files/" + file.Key,
      size: file.Size,
      url: `https://${BUCKET_NAME}.s3.${AWS.config.region}.amazonaws.com/${file.Key}`,
    }));
    res.json(files);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Serve frontend files
app.use(express.static(path.join(__dirname, 'my-app/src')));

// Handle all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'my-app/src', 'App.js'));
});

// Start server
app.listen(3001, () => {
  console.log('Server started on port 3001');
});