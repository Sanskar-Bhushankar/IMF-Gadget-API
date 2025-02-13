require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { testDatabaseConnection } = require("./config/database");

const app = express();
app.use(cors());
app.use(express.json());

const gadgetRoutes = require("./routes/gadgetRoutes");
app.use("/gadgets", gadgetRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testDatabaseConnection();
});