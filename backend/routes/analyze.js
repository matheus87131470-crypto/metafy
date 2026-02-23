import express from "express";
import { analyzeWithAI } from "../services/openaiService.js";
import { optionalFirebaseAuth } from "../middleware/firebase-auth.js";

const router = express.Router();

// Aplicar middleware de autenticação opcional
// A validação do paywall já foi feita no frontend via /api/user/analysis/use
router.post("/", optionalFirebaseAuth, async (req, res) => {
  try {
    const result = await analyzeWithAI(req.body);

    // Garantia final: nunca retornar null/undefined nos campos chave
    res.json({
      success: true,
      bestPick:      result.bestPick      || 'home',
      bestPickLabel: result.bestPickLabel || 'Vitória Casa',
      confidence:    result.confidence    || 'Leve',
      edge:          result.edge          ?? 0,
      probAdjusted:  result.probAdjusted  ?? 0,
      probImplied:   result.probImplied   ?? 0,
      summary:       result.summary       || 'Análise concluída.',
      bullets:       Array.isArray(result.bullets) ? result.bullets : [],
      // compat. legado
      analysis: result.summary,
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
