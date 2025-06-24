const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateUser = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains user-specific data like userId, driverId
    next();
  } catch (err) {
    console.error('Error authenticating user:', err);
    res.status(400).json({ message: 'Invalid token', error: err.message });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  const secret = process.env.JWT_SECRET; // Define the secret variable

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Failed to authenticate token' });
    }
    req.user = decoded; // Attach the decoded data to req.user
    next();
  });
};

module.exports = { authenticateUser, verifyToken };
