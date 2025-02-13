const express = require("express");
const { sequelize } = require("../config/database");
const { generateUniqueCodename } = require("../utils/codenameGenerator");


const router = express.Router();

// Function to generate a random success probability percentage
const generateSuccessProbability = () => `${Math.floor(Math.random() * 100) + 1}%`;

router.get("/", async (req, res) => {
  try {
    const { status } = req.query; // Get the status from query parameters

    let query = "SELECT * FROM gadgets";
    let replacements = [];

    // If a status is provided, filter gadgets by that status
    if (status) {
      query += " WHERE status = $1";
      replacements.push(status);
    }

    const [gadgets] = await sequelize.query(query, { bind: replacements });

    const gadgetsWithSuccessProbability = gadgets.map((gadget) => ({
      id: gadget.id,
      name: gadget.name,
      status: gadget.status,
      successProbability: generateSuccessProbability(),
    }));

    res.json(gadgetsWithSuccessProbability);
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to fetch gadgets!", error: error.message });
  }
});


// posting the data in the database 
router.post("/", async (req, res) => {
    try {
      console.log("📝 Received POST request:", req.body);
      
      const { name, description, status } = req.body;
      if (!name || !status) {
        console.log("❌ Validation failed: Missing name or status");
        return res.status(400).json({ message: "❌ Name and status are required!" });
      }
  
      console.log("🎲 Generating unique codename...");
      const uniqueCodename = await generateUniqueCodename();
      console.log("✨ Generated codename:", uniqueCodename);
  
      const [newGadget] = await sequelize.query(
        "INSERT INTO gadgets (name, codename, description, status) VALUES ($1, $2, $3, $4) RETURNING *",
        { 
          bind: [name, uniqueCodename, description || "No description provided", status],
          type: sequelize.QueryTypes.INSERT
        }
      );
  
      console.log("✅ Gadget created:", newGadget[0]);
      res.status(201).json({ message: "✅ Gadget added successfully!", gadget: newGadget[0] });
    } catch (error) {
      console.error("❌ Error in POST /gadgets:", error);
      res.status(500).json({ message: "❌ Failed to add gadget!", error: error.message });
    }
});
  

module.exports = router;
