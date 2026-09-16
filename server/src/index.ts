import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import goalsRoutes from "./routes/goalsRoutes.js";
import youtubeRoutes from "./routes/youtubeRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database schema
initDatabase().catch((err) => {
  console.error("Failed to initialize database:", err);
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Career Planner Backend API",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/resources", youtubeRoutes);
app.use("/api/youtube", youtubeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 AI Career Planner Express Backend server running at http://localhost:${PORT}`);
});
