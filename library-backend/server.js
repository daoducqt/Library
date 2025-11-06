const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bookRoutes = require("./src/routes/Books");
const User = require("./src/routes/User");
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/books", bookRoutes);
app.use("/auth", User);
app.get("/", (req, res) => res.send("Library API running"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));