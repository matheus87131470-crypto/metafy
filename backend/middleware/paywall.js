/**
 * middleware/paywall.js
 * Middleware de paywall para verificar acesso a análises
 */

import { canAnalyze, consumeFreeAnalysis } from '../../lib/userStore.js';

/**
 * Middleware que verifica se usuário pode fazer análise
 * Responde 402 Payment Required se bloqueado
 */
export async function checkPaywall(req, res, next) {
  try {
    // Obter userId do corpo da requisição ou header
    const userId = req.body.userId || req.headers['x-user-id'] || 'anonymous';
    
    // Verificar se pode analisar
    const access = await canAnalyze(userId);
    
    if (!access.allowed) {
      return res.status(402).json({
        success: false,
        needPayment: true,
        message: access.reason,
        freeRemaining: 0,
        isPremium: false
      });
    }
    
    // Se não é premium, consumir análise gratuita
    if (!access.isPremium) {
      await consumeFreeAnalysis(userId);
    }
    
    // Anexar informações do usuário à requisição
    req.userId = userId;
    req.userAccess = access;
    
    next();
  } catch (error) {
    console.error('❌ Erro no middleware de paywall:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar acesso'
    });
  }
}

export default checkPaywall;
