/**
 * routes/user.js
 * Rotas relacionadas a usuário e análises com Firebase Auth
 */

import express from 'express';
import { verifyFirebaseToken } from '../middleware/firebase-auth.js';
import { getUserStatus, incrementAnalysisUsage, updatePremiumStatus, getStats } from '../services/userStorageFactory.js';

const router = express.Router();

/**
 * GET /api/user/status
 * Retorna status do usuário: premium, análises restantes, etc
 */
router.get('/status', verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const status = getUserStatus(uid);
    
    res.json({
      success: true,
      user: {
        uid,
        email: req.user.email,
        name: req.user.name
      },
      ...status
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar status do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar status do usuário'
    });
  }
});

/**
 * POST /api/user/analysis/use
 * Registra uso de uma análise e valida se usuário pode usar
 * Retorna 403 se limite diário (2 análises/dia) for atingido
 */
router.post('/analysis/use', verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Verificar se pode usar
    const currentStatus = getUserStatus(uid);
    
    if (!currentStatus.canAnalyze) {
      return res.status(403).json({
        success: false,
        error: 'Limite de 2 análises gratuitas por dia atingido',
        message: 'Você já usou suas 2 análises gratuitas de hoje. Faça upgrade para Premium e tenha análises ilimitadas!',
        needPremium: true,
        isPremium: currentStatus.isPremium,
        usedToday: currentStatus.usedToday,
        remainingToday: currentStatus.remainingToday
      });
    }
    
    // Incrementar uso
    const newStatus = await incrementAnalysisUsage(uid);
    
    res.json({
      success: true,
      message: 'Análise autorizada',
      ...newStatus
    });
    
  } catch (error) {
    console.error('❌ Erro ao registrar análise:', error);
    
    if (error.code === 'LIMIT_EXCEEDED') {
      return res.status(403).json({
        success: false,
        error: error.message,
        message: 'Você atingiu o limite de análises gratuitas. Faça upgrade para Premium!',
        needPremium: true
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar análise',
      message: error.message
    });
  }
});

/**
 * POST /api/user/premium
 * Atualizar status premium (admin ou webhook do MercadoPago)
 */
router.post('/premium', verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { isPremium, premiumUntil } = req.body;
    
    // Validar dados
    if (typeof isPremium !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Campo isPremium inválido'
      });
    }
    
    const status = await updatePremiumStatus(uid, isPremium, premiumUntil);
    
    res.json({
      success: true,
      message: 'Status premium atualizado',
      ...status
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar premium:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar status premium'
    });
  }
});

/**
 * GET /api/user/stats
 * Estatísticas gerais (pode ser usado para dashboard admin)
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = getStats();
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    });
  }
});

export default router;

