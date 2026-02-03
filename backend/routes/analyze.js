import express from "express";
import { analyzeWithAI } from "../services/openaiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const analysis = await analyzeWithAI(req.body);
    res.json({ analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro na análise IA" });
  }
});

export default router;
