import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.js";
import gamesRoute from "./routes/games.js";

dotenv.config();

const app = express();

// CORS configurado para aceitar requisições do frontend
const corsOptions = {
  origin: '*', // Permite de qualquer origem (Vercel, localhost, etc)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/api/analyze", analyzeRoute);
app.use("/api/games", gamesRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Metafy Backend rodando na porta", PORT);
});
