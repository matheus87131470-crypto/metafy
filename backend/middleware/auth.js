/**
 * middleware/auth.js
 * Middleware de autenticação para proteger rotas
 */

import { verifyToken } from '../../lib/userStore.js';

/**
 * Middleware que verifica se usuário está autenticado
 * Anexa usuário em req.user se válido
 */
export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Autenticação necessária',
        needAuth: true
      });
    }
    
    // Verificar token
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado',
        needAuth: true
      });
    }
    
    // Anexar usuário à requisição
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('❌ Erro no middleware de auth:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar autenticação'
    });
  }
}

/**
 * Middleware opcional - tenta autenticar mas não bloqueia
 * Útil para rotas que funcionam com ou sem login
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const user = await verifyToken(token);
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro no middleware de optionalAuth:', error);
    next(); // Continua mesmo com erro
  }
}

export default requireAuth;
