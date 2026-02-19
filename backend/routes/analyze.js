import express from "express";
import { analyzeWithAI } from "../services/openaiService.js";
import { optionalFirebaseAuth } from "../middleware/firebase-auth.js";

const router = express.Router();

// Aplicar middleware de autenticação opcional
// A validação do paywall já foi feita no frontend via /api/user/analysis/use
router.post("/", optionalFirebaseAuth, async (req, res) => {
  try {
    const analysis = await analyzeWithAI(req.body);
    
    // Retornar análise
    res.json({ 
      success: true,
      analysis
    });
  } catch (err) {
    console.error('❌ Erro na análise IA:', err);
    res.status(500).json({ 
      success: false,
      error: "Erro na análise IA",
      message: err.message
    });
  }
});

export default router;
