const express = require("express");
const cors = require("cors");
const app = express();
const membershipRoutes = require("../src/routes/membershipRoutes");
const dotenv = require("dotenv");
dotenv.config();
const db = require("../src/config/db");

app.use(cors());
app.use(express.json());

app.use("/api/v1/membership", membershipRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Temp Server running on port ${PORT}`);
  console.log("Routes registered:");
  membershipRoutes.stack.forEach((r) => {
    if (r.route) {
      console.log(r.route.path);
    }
  });
});
