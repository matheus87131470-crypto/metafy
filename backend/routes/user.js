/**
 * routes/user.js
 * Rotas de usuário e status
 */

import express from 'express';
import { getUserStatus } from '../../lib/userStore.js';

const router = express.Router();

/**
 * GET /api/user/:userId
 * Retorna status completo do usuário
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const status = await getUserStatus(userId);
    
    res.json({
      success: true,
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
 * GET /api/me?userId=xxx
 * Retorna status do usuário atual (via query param)
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || 'anonymous';
    
    const status = await getUserStatus(userId);
    
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('❌ Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar status'
    });
  }
});

export default router;
