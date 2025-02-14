const express = require("express");
const prisma = require('../lib/prisma');
const { generateUniqueCodename } = require("../utils/codenameGenerator");
const { v4: uuidv4 } = require('uuid');
const { auth, adminOnly, allowRoles } = require('../middleware/auth');

const router = express.Router();

// Function to generate a random success probability percentage
const generateSuccessProbability = () => `${Math.floor(Math.random() * 100) + 1}%`;

// Add this helper function at the top with other utility functions
const generateVerificationCode = () => {
  // Generate a random 6-digit number and convert to string with leading zeros
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  // Generate a random letter (A-Z)
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${number}${letter}`;
};

// Add auth middleware to all routes
router.use(auth);

// Allow both USER and ADMIN to access GET endpoint
router.get("/", allowRoles(['USER', 'ADMIN']), async (req, res) => {
  try {
    const { status } = req.query;
    
    // Validate status if provided
    if (status && !['Available', 'Deployed', 'Destroyed', 'Decommissioned'].includes(status)) {
      return res.status(400).json({ 
        message: "❌ Invalid status! Must be one of: Available, Deployed, Destroyed, Decommissioned" 
      });
    }

    // Build where clause
    const whereClause = status ? { status } : {};

    // Get gadgets with filter
    const gadgets = await prisma.gadget.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        name: true,
        codename: true,
        status: true,
        created_at: true,
        last_mission_date: true,
        description: true
      }
    });

    // Add success probability to each gadget
    const gadgetsWithSuccessProbability = gadgets.map((gadget) => ({
      ...gadget,
      successProbability: generateSuccessProbability()
    }));

    console.log(`✅ Found ${gadgets.length} gadgets${status ? ` with status: ${status}` : ''}`);
    res.json(gadgetsWithSuccessProbability);

  } catch (error) {
    console.error("❌ Error fetching gadgets:", error);
    res.status(500).json({ 
      message: "❌ Failed to fetch gadgets!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("📝 Received POST request:", req.body);
    
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "❌ Name is required!" });
    }

    console.log("🎲 Generating unique codename...");
    const uniqueCodename = await generateUniqueCodename();
    console.log("✨ Generated codename:", uniqueCodename);

    const newGadget = await prisma.gadget.create({
      data: {
        id: uuidv4(),
        name,
        codename: uniqueCodename,
        description: description || "No description provided",
        status: 'Available'
      }
    });

    console.log("✅ Gadget created:", newGadget);
    res.status(201).json({ 
      message: "✅ Gadget added successfully!", 
      gadget: newGadget 
    });

  } catch (error) {
    console.error("❌ Error in POST /gadgets:", error);
    res.status(500).json({ 
      message: "❌ Failed to add gadget!", 
      error: error.message 
    });
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

router.delete("/:identifier", auth, adminOnly, async (req, res) => {
  try {
    const { identifier } = req.params;
    console.log("🗑️ Attempting to decommission gadget:", identifier);

    // Determine if identifier is UUID or codename
    const isUUID = identifier.includes('-');
    
    // Find the gadget first
    const existingGadget = await prisma.gadget.findUnique({
      where: isUUID 
        ? { id: identifier }
        : { codename: identifier }
    });

    if (!existingGadget) {
      console.log("❌ Gadget not found:", identifier);
      return res.status(404).json({ 
        message: "❌ Gadget not found!" 
      });
    }

    // Check if gadget is already decommissioned
    if (existingGadget.status === 'Decommissioned') {
      return res.status(400).json({ 
        message: "❌ Gadget is already decommissioned!" 
      });
    }

    // Update using Prisma's update method instead of raw SQL
    const decommissionedGadget = await prisma.gadget.update({
      where: {
        id: existingGadget.id
      },
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
    console.error("❌ Detailed error in decommission:", error);
    res.status(500).json({ 
      message: "❌ Failed to decommission gadget!",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update the self-destruct endpoint
router.post("/:identifier/self-destruct", auth, adminOnly, async (req, res) => {
  try {
    const { identifier } = req.params;
    console.log("💥 Attempting to self-destruct gadget:", identifier);

    // Determine if identifier is UUID or codename
    const isUUID = identifier.includes('-');
    
    // Find the gadget first
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

    // Check if gadget is already decommissioned
    if (existingGadget.status === 'Decommissioned') {
      return res.status(400).json({ 
        message: "❌ Gadget is already decommissioned!" 
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Update the gadget status to Decommissioned
    const destroyedGadget = await prisma.gadget.update({
      where: {
        id: existingGadget.id
      },
      data: {
        status: 'Decommissioned',
        updated_at: new Date(),
        decommissioned_at: new Date()
      }
    });

    res.json({ 
      message: "💥 Gadget has been destroyed!", 
      verificationId: verificationCode,
      gadget: destroyedGadget 
    });

  } catch (error) {
    console.error("❌ Error in self-destruct:", error);
    res.status(500).json({ 
      message: "❌ Failed to destroy gadget!" 
    });
  }
});

module.exports = router;
