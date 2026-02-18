import express from "express";
import { analyzeWithAI } from "../services/openaiService.js";
import { checkPaywall } from "../middleware/paywall.js";

const router = express.Router();

// Aplicar middleware de paywall
router.post("/", checkPaywall, async (req, res) => {
  try {
    const analysis = await analyzeWithAI(req.body);
    
    // Retornar análise com status do usuário
    res.json({ 
      success: true,
      analysis,
      userStatus: {
        isPremium: req.userAccess.isPremium,
        freeRemaining: req.userAccess.freeRemaining,
        daysRemaining: req.userAccess.daysRemaining
      }
    });
  } catch (err) {
    console.error('❌ Erro na análise IA:', err);
    res.status(500).json({ 
      success: false,
      error: "Erro na análise IA" 
    });
  }
});

export default router;
