require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { testDatabaseConnection } = require("./config/database");

const app = express();

// Configure CORS to allow credentials
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET, // Using the same secret as JWT
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production
    httpOnly: true,
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

const authRoutes = require("./routes/authRoutes");
const gadgetRoutes = require("./routes/gadgetRoutes");

app.use("/auth", authRoutes);
app.use("/gadgets", gadgetRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testDatabaseConnection();
});