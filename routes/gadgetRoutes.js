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

router.patch("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params; // This can be either id or codename
    const { name, description, status } = req.body;

    // Validate status
    if (status && !['Available', 'Deployed'].includes(status)) {
      return res.status(400).json({ 
        message: "❌ Status can only be 'Available' or 'Deployed'!" 
      });
    }

    // Check if any updateable fields are provided
    if (!name && !description && !status) {
      return res.status(400).json({ 
        message: "❌ At least one field (name, description, or status) must be provided!" 
      });
    }

    // Determine if identifier is UUID or codename
    const isUUID = identifier.includes('-');
    
    // Find the gadget first to check its current status
    const existingGadget = await prisma.gadget.findUnique({
      where: isUUID 
        ? { id: identifier }
        : { codename: identifier }
    });

    if (!existingGadget) {
      return res.status(404).json({ 
        message: "❌ Gadget not found!" 
      });
    }

    // Check if gadget is already decommissioned or destroyed
    if (['Decommissioned', 'Destroyed'].includes(existingGadget.status)) {
      return res.status(400).json({ 
        message: `❌ Cannot update a ${existingGadget.status.toLowerCase()} gadget!` 
      });
    }

    // Update the gadget
    const updatedGadget = await prisma.gadget.update({
      where: isUUID 
        ? { id: identifier }
        : { codename: identifier },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
        updated_at: new Date()
      }
    });

    console.log("✅ Gadget updated:", updatedGadget);
    res.json({ 
      message: "✅ Gadget updated successfully!", 
      gadget: updatedGadget 
    });

  } catch (error) {
    console.error("❌ Error in PATCH /gadgets:", error);
    res.status(500).json({ 
      message: "❌ Failed to update gadget!" 
    });
  }
});

router.delete("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params; // This can be either id or codename

    // Determine if identifier is UUID or codename
    const isUUID = identifier.includes('-');
    
    // Find the gadget first to check its current status
    const existingGadget = await prisma.gadget.findUnique({
      where: isUUID 
        ? { id: identifier }
        : { codename: identifier }
    });

    if (!existingGadget) {
      return res.status(404).json({ 
        message: "❌ Gadget not found!" 
      });
    }

    // Check if gadget is already decommissioned or destroyed
    if (['Decommissioned', 'Destroyed'].includes(existingGadget.status)) {
      return res.status(400).json({ 
        message: `❌ Gadget is already ${existingGadget.status.toLowerCase()}!` 
      });
    }

    // Update the gadget to Decommissioned status
    const decommissionedGadget = await prisma.gadget.update({
      where: isUUID 
        ? { id: identifier }
        : { codename: identifier },
      data: {
        status: 'Decommissioned',
        decommissioned_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log("✅ Gadget decommissioned:", decommissionedGadget);
    res.json({ 
      message: "✅ Gadget decommissioned successfully!", 
      gadget: decommissionedGadget 
    });

  } catch (error) {
    console.error("❌ Error in DELETE /gadgets:", error);
    res.status(500).json({ 
      message: "❌ Failed to decommission gadget!" 
    });
  }
});

module.exports = router;
