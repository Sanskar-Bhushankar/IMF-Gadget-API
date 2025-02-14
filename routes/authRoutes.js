const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "❌ Username and password are required!" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ message: "❌ Username already exists!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    });

    // Set session
    req.session.userId = user.id;

    res.status(201).json({
      message: "✅ User created successfully!",
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(400).json({ 
      message: "❌ Failed to create user!",
      error: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "❌ Username and password are required!" });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "❌ Invalid credentials!" });
    }

    // Set session
    req.session.userId = user.id;

    res.json({
      message: "✅ Login successful!",
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(400).json({ 
      message: "❌ Login failed!",
      error: error.message 
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "❌ Failed to logout!" });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ message: "✅ Logged out successfully!" });
  });
});

module.exports = router; 