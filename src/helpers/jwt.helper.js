const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

// Blacklist the token by storing it in Redis with the remaining expiration time
async function blacklistToken(token) {
  const decoded = jwt.decode(token);
  const expirationTime = decoded.exp - Math.floor(Date.now() / 1000); // Calculate remaining TTL

  // Store the token in Redis with expiration time equal to the token's remaining time
  await redisClient.setEx(`blacklist_${token}`, expirationTime, 'blacklisted');
}

// Verify if the token is valid and not blacklisted
async function verifyToken(token) {
  const isBlacklisted = await redisClient.get(`blacklist_${token}`);
  if (isBlacklisted) {
    throw new Error('Token is blacklisted');
  }

  // If not blacklisted, verify the token
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateToken,
  blacklistToken,
  verifyToken,
};
