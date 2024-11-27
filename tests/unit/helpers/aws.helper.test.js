const { uploadFileToS3 } = require('../../../src/helpers/aws.helper');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../../../src/utils/aws');
const fs = require('fs').promises;
const { ApiError } = require('../../../src/helpers/response.helper');

// Mocking S3 client and fs methods
jest.mock('../../../src/utils/aws', () => ({
  send: jest.fn(),
}));

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe('AWS Helper - uploadFileToS3', () => {
  const mockFile = {
    path: 'mock/path/to/file.jpg',
    originalname: 'file.jpg',
    mimetype: 'image/jpeg', // Supported file type for validation test
  };

  const unsupportedFile = {
    path: 'mock/path/to/file.txt',
    originalname: 'file.txt',
    mimetype: 'text/plain', // Unsupported file type for validation test
  };

  const userId = '1234';
  const bucketName = 'mock-bucket-name';
  const region = 'mock-region';

  beforeAll(() => {
    process.env.S3_BUCKET_NAME = bucketName;
    process.env.AWS_REGION = region;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a file to S3 successfully and return the file URL', async () => {
    const fileContent = Buffer.from('mock file content');
    const mockUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${userId}.jpg`;

    fs.readFile.mockResolvedValue(fileContent);
    fs.unlink.mockResolvedValue(undefined);
    s3Client.send.mockResolvedValue({});

    const result = await uploadFileToS3(mockFile, userId);

    expect(fs.readFile).toHaveBeenCalledWith(mockFile.path);
    expect(fs.unlink).toHaveBeenCalledWith(mockFile.path);
    expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(result).toEqual(mockUrl);

    const sentCommand = s3Client.send.mock.calls[0][0];
    expect(sentCommand.input).toEqual({
      Bucket: bucketName,
      Key: `${userId}.jpg`,
      Body: fileContent,
      ContentType: mockFile.mimetype,
    });
  });

  it('should throw an ApiError if the file type is unsupported', async () => {
    await expect(uploadFileToS3(unsupportedFile, userId)).rejects.toThrow(
      new ApiError(400, 'Unsupported file type. Please upload a JPEG, PNG, or PDF file.')
    );

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(s3Client.send).not.toHaveBeenCalled();
    expect(fs.unlink).not.toHaveBeenCalled();
  });

  it('should throw an ApiError if reading the file fails', async () => {
    const mockError = new Error('Failed to read file');
    fs.readFile.mockRejectedValue(mockError); // Simulate readFile failure
    fs.unlink.mockResolvedValue(undefined); // Simulate successful file cleanup

    await expect(uploadFileToS3(mockFile, userId)).rejects.toThrow(ApiError);

    expect(fs.readFile).toHaveBeenCalledWith(mockFile.path);
    expect(s3Client.send).not.toHaveBeenCalled();
    expect(fs.unlink).toHaveBeenCalledWith(mockFile.path); // Expect unlink to be called
  });

  it('should throw an ApiError if uploading to S3 fails', async () => {
    const fileContent = Buffer.from('mock file content');
    const mockError = new Error('S3 upload failed');

    fs.readFile.mockResolvedValue(fileContent);
    fs.unlink.mockResolvedValue(undefined);
    s3Client.send.mockRejectedValue(mockError);

    await expect(uploadFileToS3(mockFile, userId)).rejects.toThrow(ApiError);

    expect(fs.readFile).toHaveBeenCalledWith(mockFile.path);
    expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(fs.unlink).toHaveBeenCalledWith(mockFile.path);
  });

  it('should still remove the local file if the upload fails', async () => {
    const fileContent = Buffer.from('mock file content');
    const mockError = new Error('S3 upload failed');

    fs.readFile.mockResolvedValue(fileContent);
    fs.unlink.mockResolvedValue(undefined);
    s3Client.send.mockRejectedValue(mockError);

    await expect(uploadFileToS3(mockFile, userId)).rejects.toThrow(ApiError);

    expect(fs.unlink).toHaveBeenCalledWith(mockFile.path);
  });
});
