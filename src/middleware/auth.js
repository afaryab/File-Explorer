const jwt = require('jsonwebtoken');

// JWT Secret - MUST be set in production via environment variable
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

// Use a default only for development
const SECRET = JWT_SECRET || 'dev-secret-change-in-production';

function optionalAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid but we continue anyway (optional auth)
    }
  }
  
  next();
}

function requireAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { optionalAuth, requireAuth, JWT_SECRET: SECRET };
