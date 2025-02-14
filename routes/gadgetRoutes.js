const express = require("express");
const prisma = require('../lib/prisma');
const { generateUniqueCodename } = require("../utils/codenameGenerator");

const router = express.Router();

// Function to generate a random success probability percentage
const generateSuccessProbability = () => `${Math.floor(Math.random() * 100) + 1}%`;

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = status ? { status } : {};
    const gadgets = await prisma.gadget.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    });

    const gadgetsWithSuccessProbability = gadgets.map((gadget) => ({
      id: gadget.id,
      name: gadget.name,
      status: gadget.status,
      successProbability: generateSuccessProbability(),
      created_at: gadget.created_at,
      last_mission_date: gadget.last_mission_date
    }));

    res.json(gadgetsWithSuccessProbability);
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to fetch gadgets!" });
  }
});

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

    const newGadget = await prisma.gadget.create({
      data: {
        name,
        codename: uniqueCodename,
        description: description || "No description provided",
        status: status,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log("✅ Gadget created:", newGadget);
    res.status(201).json({ message: "✅ Gadget added successfully!", gadget: newGadget });
  } catch (error) {
    console.error("❌ Error in POST /gadgets:", error);
    res.status(500).json({ message: "❌ Failed to add gadget!", error: error.message });
  }
});

module.exports = router;
