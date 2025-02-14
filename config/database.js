// We can remove this file entirely since we're using Prisma

// If you want to keep it for future reference, you can simplify it to:
const testDatabaseConnection = async () => {
  try {
    const prisma = require('../lib/prisma');
    await prisma.$connect();
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

module.exports = { testDatabaseConnection };
