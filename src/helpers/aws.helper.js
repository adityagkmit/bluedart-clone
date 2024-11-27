const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const s3Client = require('../utils/aws');
const { ApiError } = require('../helpers/response.helper');
require('dotenv').config();

const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];

const generateFileName = (originalFileName, uniqueName) => {
  const fileExtension = originalFileName.split('.').pop();
  return `${uniqueName}.${fileExtension}`;
};

async function uploadFileToS3(file, userId) {
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!allowedFileTypes.includes(file.mimetype)) {
    throw new ApiError(400, 'Unsupported file type. Please upload a JPEG, PNG, or PDF file.');
  }

  try {
    const fileBuffer = await fs.readFile(file.path);
    const fileName = generateFileName(file.originalname, userId);

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

    await fs.unlink(file.path).catch(() => {
      console.error('Failed to remove local file:', file.path);
    });

    if (error.code === 'ENOENT' || error.message.includes('read')) {
      throw new ApiError(400, 'Failed to read the file.');
    }
    throw new ApiError(400, 'Failed to upload file to S3.');
  }
}

module.exports = { uploadFileToS3 };
