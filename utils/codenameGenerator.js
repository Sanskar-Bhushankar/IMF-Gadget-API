const { uniqueNamesGenerator, adjectives, animals } = require("unique-names-generator");
const { sequelize } = require("../config/database");

const generateUniqueCodename = async () => {
  let codename;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    console.log(`🎲 Attempt ${attempts} to generate unique codename`);
    
    codename = uniqueNamesGenerator({ 
      dictionaries: [adjectives, animals], 
      separator: " ", 
      style: "capital" 
    });
    console.log(`Generated codename: ${codename}`);

    try {
      // Check if codename already exists in DB
      const [results] = await sequelize.query(
        "SELECT COUNT(*) FROM gadgets WHERE codename = $1",
        { 
          bind: [codename],
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log(`Database check result:`, results);
      // PostgreSQL returns the count as count property
      if (parseInt(results.count) === 0) {
        isUnique = true;
        console.log(`✅ Unique codename found: ${codename}`);
      }
    } catch (error) {
      console.error("Error checking codename uniqueness:", error);
      throw error;
    }
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique codename after 10 attempts");
  }

  return codename;
};

module.exports = { generateUniqueCodename };
