const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const s3Client = require('../utils/aws');
require('dotenv').config();

const generateFileName = (originalFileName, uniqueName) => {
  const fileExtension = originalFileName.split('.').pop();

  return `${uniqueName}.${fileExtension}`;
};

async function uploadFileToS3(file, userId) {
  const bucketName = process.env.S3_BUCKET_NAME;

  const fileBuffer = await fs.readFile(file.path);
  const fileName = generateFileName(file.originalname, userId);

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    await fs.unlink(file.path);

    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    fs.unlink(file.path);
    throw new Error('Failed to upload file.');
  }
}

module.exports = { uploadFileToS3 };
