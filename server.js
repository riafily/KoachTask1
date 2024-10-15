const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist/aws-json/browser')));
const s3 = new AWS.S3();

async function retrieveAllJsonFilesFromS3(bucketName) {
    const params = {
        Bucket: bucketName,
    };

    try {
        const listObjectsResponse = await s3.listObjectsV2(params).promise();
        const jsonFiles = listObjectsResponse.Contents.filter(file => file.Key.endsWith('.json'));
        const jsonDataArray = await Promise.all(
            jsonFiles.map(async (file) => {
                const fileParams = {
                    Bucket: bucketName,
                    Key: file.Key,
                };
                const fileData = await s3.getObject(fileParams).promise();
                return JSON.parse(fileData.Body.toString('utf-8'));
            })
        );

        console.log('Successfully retrieved all JSON files from S3:', jsonDataArray);
        return jsonDataArray;
    } catch (error) {
        console.error('Error retrieving JSON files from S3:', error);
    }
}


async function uploadDataToS3(bucketName, jsonData) {
    const key = `json-data-${Date.now()}.json`;
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(jsonData),
        ContentType: 'application/json',
    };

    try {
        const data = await s3.putObject(params).promise();
        console.log('Successfully uploaded JSON to S3', data);
    } catch (error) {
        console.error('Error uploading JSON to S3:', error);
    }
}

app.get('/retrieve-json-data', async (req, res) => {
    try {
        const jsonData = await retrieveAllJsonFilesFromS3(process.env.AWS_BUCKET_NAME);
        res.status(200).json(jsonData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data from S3' });
    }
});

app.post('/upload-json-data', async (req, res) => {
    const { name, age } = req.body;
    try {
        const jsonData = await uploadDataToS3(process.env.AWS_BUCKET_NAME, { name, age });
        res.status(200).json(jsonData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data from S3' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/aws-json/browser/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});