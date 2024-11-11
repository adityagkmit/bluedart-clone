const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

const connectToRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis...');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
};

redisClient.on('error', err => {
  console.error('Redis connection error:', err);
});

module.exports = { redisClient, connectToRedis };
