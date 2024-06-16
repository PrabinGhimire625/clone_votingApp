const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();
const db = require("./db"); // Ensure this file properly connects to your database
const PORT = process.env.PORT || 3000;

// Import router files
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
// Apply body-parser middleware
app.use(bodyParser.json());

// Apply routes and authentication middleware
app.use("/user", userRoutes); // Apply authentication to /user routes
app.use("/candidate", candidateRoutes); 

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
