const express = require("express");
const Gadget = require("../models/Gadget");
const { generateUniqueCodename } = require("../utils/codenameGenerator");

const router = express.Router();

// Function to generate a random success probability percentage
const generateSuccessProbability = () => `${Math.floor(Math.random() * 100) + 1}%`;

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = status ? { status } : {};
    const gadgets = await Gadget.findAll({
      where: whereClause
    });

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

    const newGadget = await Gadget.create({
      name,
      codename: uniqueCodename,
      description: description || "No description provided",
      status
    });

    console.log("✅ Gadget created:", newGadget);
    res.status(201).json({ message: "✅ Gadget added successfully!", gadget: newGadget });
  } catch (error) {
    console.error("❌ Error in POST /gadgets:", error);
    res.status(500).json({ message: "❌ Failed to add gadget!", error: error.message });
  }
});

module.exports = router;
