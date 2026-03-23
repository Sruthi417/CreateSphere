import express from "express";
import cors from "cors";
import { CLIENT_URL } from "./config/env.js";
import router from "./routes.js";
import path from "path";

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: CLIENT_URL || "http://localhost:3000",
    credentials: true
  })
);

// ✅ serve images from uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", router);

// Health check
app.get("/", (req, res) => {
  res.send("CreateSphere Backend Running");
});

export default app;
