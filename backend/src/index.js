import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/database.js";
import { generalLimiter } from "./middleware/rateLimit.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import inspectRoutes from "./routes/inspect.js";
import buildRoutes from "./routes/build.js";
import snippetRoutes from "./routes/snippets.js";
import historyRoutes from "./routes/history.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://dev-lens-gamma.vercel.app",
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/inspect", inspectRoutes);
app.use("/api/build", buildRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/history", historyRoutes);

app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  }),
);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () =>
  console.log(`🚀 Inspectra API running on https://dev-lens-gamma.vercel.app`),
);
