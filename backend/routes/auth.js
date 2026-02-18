/**
 * routes/auth.js
 * Rotas de autenticação (registro, login, logout)
 */

import express from 'express';
import { 
  registerUser, 
  authenticateUser, 
  verifyToken,
  logoutUser,
  getUserByEmail
} from '../../lib/userStore.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrar novo usuário
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validações
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter no mínimo 6 caracteres'
      });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }
    
    // Registrar usuário
    const result = await registerUser(email.toLowerCase(), password, name);
    
    if (result && result.error) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar conta'
      });
    }
    
    // Login automático após registro
    const authResult = await authenticateUser(email.toLowerCase(), password);
    
    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      user: authResult.user,
      token: authResult.token
    });
    
  } catch (error) {
    console.error('❌ Erro ao registrar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar conta'
    });
  }
});

/**
 * POST /api/auth/login
 * Fazer login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validações
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }
    
    // Autenticar
    const result = await authenticateUser(email.toLowerCase(), password);
    
    if (result && result.error) {
      return res.status(401).json({
        success: false,
        error: result.error
      });
    }
    
    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao fazer login'
      });
    }
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: result.user,
      token: result.token
    });
    
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer login'
    });
  }
});

/**
 * POST /api/auth/logout
 * Fazer logout
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token não fornecido'
      });
    }
    
    // Verificar token e obter usuário
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    // Fazer logout
    await logoutUser(user.id);
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer logout'
    });
  }
});

/**
 * GET /api/auth/me
 * Obter dados do usuário autenticado
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado'
      });
    }
    
    // Verificar token
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do usuário'
    });
  }
});

/**
 * POST /api/auth/verify
 * Verificar se token é válido
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Token não fornecido'
      });
    }
    
    const user = await verifyToken(token);
    
    if (!user) {
      return res.json({
        success: true,
        valid: false
      });
    }
    
    res.json({
      success: true,
      valid: true,
      user
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar token'
    });
  }
});

export default router;
