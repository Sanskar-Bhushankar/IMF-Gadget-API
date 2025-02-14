const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const auth = async (req, res, next) => {
  try {
    console.log('Session:', req.session);
    console.log('Session ID:', req.sessionID);
    console.log('User ID in session:', req.session.userId);

    if (!req.session.userId) {
      return res.status(401).json({ message: "❌ Authentication required!" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId }
    });

    if (!user) {
      console.log('User not found for ID:', req.session.userId);
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ message: "❌ Please authenticate!" });
  }
};

const adminOnly = async (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "❌ Admin access required!" });
  }
  next();
};

// New middleware for role-based access
const allowRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "❌ You don't have permission to access this resource!" 
      });
    }
    next();
  };
};

module.exports = { auth, adminOnly, allowRoles }; 