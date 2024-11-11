const { verifyToken } = require('../helpers/jwt.helper');
const { User, Role } = require('../models');

const auth = async (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = await verifyToken(token);

    // Fetch user based on decoded token data
    const user = await User.findByPk(decoded.id, {
      include: { model: Role, through: { attributes: [] }, required: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = user;
    req.user.roles = user.Roles.map(role => role.name);

    next();
  } catch (error) {
    if (error.message === 'Token is blacklisted') {
      return res.status(401).json({ message: 'Token has been revoked.' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(400).json({ message: 'An error occurred during authentication.' });
  }
};

module.exports = { auth };
