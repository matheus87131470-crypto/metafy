import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.js";
import gamesRoute from "./routes/games.js";
import userRoute from "./routes/user.js";
import paymentsRoute from "./routes/payments.js";
import webhooksRoute from "./routes/webhooks.js";
import authRoute from "./routes/auth.js";
import topPicksRoute from "./routes/top-picks.js";
import matchesTodayHandler from "./routes/matches-today.js";
// import matchesLiveHandler from "./routes/matches-live.js"; // REMOVIDO: não usa mais RapidAPI

dotenv.config();

const app = express();

// ✅ CORS configurado para aceitar requisições do frontend
app.use(cors({
  origin: [
    "https://metafy.store",
    "https://www.metafy.store",
    "https://metafy-gamma.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Id"],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas de autenticação
app.use("/api/auth", authRoute);

// Webhooks (antes das outras rotas para evitar conflito)
app.use("/api/webhooks", webhooksRoute);

// Top Picks via API-Football
app.use("/api/top-picks", topPicksRoute);

// Rotas protegidas/públicas
app.use("/api/analyze", analyzeRoute);
app.use("/api/games", gamesRoute);
app.use("/api/user", userRoute);
app.use("/api/me", userRoute); // Alias para /api/user
app.use("/api/payments", paymentsRoute);

// Local data routes
app.get('/api/matches/today', matchesTodayHandler);
// app.get('/api/matches/live', matchesLiveHandler); // REMOVIDO: não usa mais RapidAPI

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Metafy Backend rodando na porta", PORT);
  console.log("📍 Rotas disponíveis:");
  console.log("   POST /api/auth/register");
  console.log("   POST /api/auth/login");
  console.log("   POST /api/auth/logout");
  console.log("   GET  /api/auth/me");
  console.log("   POST /api/analyze (com paywall)");
  console.log("   GET  /api/user/:userId");
  console.log("   GET  /api/me?userId=xxx");
  console.log("   GET  /api/top-picks/today");
  console.log("   POST /api/payments/pix");
  console.log("   GET  /api/payments/pix/status/:chargeId");
  console.log("   POST /api/payments/simulate-approval");
  console.log("   POST /api/webhooks/pix");
  console.log("   GET  /api/matches/today");
});
