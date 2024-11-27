const { redisClient, connectToRedis } = require('../../../src/config/redis');
const redis = require('redis');
const dotenv = require('dotenv');

// Mocking dotenv to simulate environment variables for testing
dotenv.config = jest.fn();
dotenv.config.mockReturnValue({
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
});

// Mock the redis package to mock createClient and the methods on redisClient
jest.mock('redis', () => {
  const mRedisClient = {
    connect: jest.fn(),
    on: jest.fn(),
  };
  return {
    createClient: jest.fn(() => mRedisClient),
  };
});

describe('Redis Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call connectToRedis and log success message on connection', async () => {
    console.log = jest.fn();

    // Mock a successful connection
    redisClient.connect = jest.fn().mockResolvedValue('Connected');

    await connectToRedis();

    expect(redisClient.connect).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Connected to Redis...');
  });

  it('should log an error message if connection fails', async () => {
    console.error = jest.fn();

    // Mock a failed connection
    redisClient.connect = jest.fn().mockRejectedValue(new Error('Connection error'));

    await connectToRedis();

    expect(redisClient.connect).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Redis connection error:', new Error('Connection error'));
  });
});
