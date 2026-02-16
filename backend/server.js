import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.js";
import gamesRoute from "./routes/games.js";
import matchesTodayHandler from "./routes/matches-today.js";

dotenv.config();

const app = express();

// ✅ CORS configurado para aceitar requisições do frontend
app.use(cors({
  origin: [
    "https://metafy-gamma.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/api/analyze", analyzeRoute);
app.use("/api/games", gamesRoute);

// RapidAPI routes
app.get('/api/matches/today', matchesTodayHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Metafy Backend rodando na porta", PORT);
});
