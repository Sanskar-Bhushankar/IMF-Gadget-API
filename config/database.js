const { Sequelize } = require("sequelize");
require("dotenv").config(); // Load environment variables

// Connect to PostgreSQL database using DATABASE_URL from .env
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "postgres",
  logging: console.log, // Enable logging temporarily for debugging
});

// Function to check database connection
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    
    // Test if the gadgets table exists
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'gadgets'
      );
    `);
    console.log("Gadgets table exists:", results[0].exists);
    
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

module.exports = { sequelize, testDatabaseConnection };
