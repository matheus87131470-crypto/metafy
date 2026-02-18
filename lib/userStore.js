/**
 * userStore.js
 * Persistência simples de usuários em arquivo JSON com paywall e autenticação
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../data/users.json');
const FREE_ANALYSES_LIMIT = 2; // 2 análises grátis por usuário
const PREMIUM_DURATION_DAYS = 7; // Premium dura 7 dias

/**
 * Hash de senha usando SHA-256
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Gera token de sessão aleatório
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Garante que o arquivo users.json existe
 */
async function ensureFileExists() {
  try {
    await fs.access(USERS_FILE);
  } catch {
    // Arquivo não existe, criar com objeto vazio
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, '{}', 'utf8');
  }
}

/**
 * Lê todos os usuários do arquivo
 */
async function readUsers() {
  try {
    await ensureFileExists();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erro ao ler users.json:', error);
    return {};
  }
}

/**
 * Salva todos os usuários no arquivo
 */
async function writeUsers(users) {
  try {
    await ensureFileExists();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('❌ Erro ao escrever users.json:', error);
    return false;
  }
}

/**
 * Obtém dados de um usuário (cria se não existir)
 * @param {string} userId - ID do usuário
 * @returns {object} Dados do usuário
 */
async function getUser(userId) {
  const users = await readUsers();
  
  if (!users[userId]) {
    // Criar novo usuário com 2 análises grátis
    users[userId] = {
      id: userId,
      freeRemaining: FREE_ANALYSES_LIMIT,
      premiumUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await writeUsers(users);
  }
  
  return users[userId];
}

/**
 * Atualiza dados de um usuário
 * @param {string} userId - ID do usuário
 * @param {object} updates - Dados a atualizar
 */
async function updateUser(userId, updates) {
  try {
    const users = await readUsers();
    users[userId] = {
      ...users[userId],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await writeUsers(users);
    return users[userId];
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    return null;
  }
}

/**
 * Verifica se usuário pode fazer análise (paywall principal)
 * @param {string} userId - ID do usuário
 * @returns {object} { allowed: boolean, reason?: string, user: object }
 */
async function canAnalyze(userId) {
  const user = await getUser(userId);
  const now = new Date();
  
  // 1. Verificar se é premium ativo
  if (user.premiumUntil) {
    const premiumEnd = new Date(user.premiumUntil);
    if (now <= premiumEnd) {
      return { 
        allowed: true, 
        user,
        isPremium: true,
        daysRemaining: Math.ceil((premiumEnd - now) / (1000 * 60 * 60 * 24))
      };
    }
  }
  
  // 2. Premium expirado, verificar análises grátis restantes
  if (user.freeRemaining > 0) {
    return { 
      allowed: true, 
      user,
      isPremium: false,
      freeRemaining: user.freeRemaining
    };
  }
  
  // 3. Bloqueado - sem premium e sem análises grátis
  return {
    allowed: false,
    reason: 'Limite gratuito atingido. Assine Premium para continuar.',
    needPayment: true,
    user
  };
}

/**
 * Consome uma análise gratuita (decrementa freeRemaining)
 * @param {string} userId - ID do usuário
 */
async function consumeFreeAnalysis(userId) {
  const user = await getUser(userId);
  
  if (user.freeRemaining > 0) {
    const newRemaining = user.freeRemaining - 1;
    await updateUser(userId, { freeRemaining: newRemaining });
    console.log(`✅ Análise gratuita consumida: ${userId} (restam ${newRemaining})`);
    return true;
  }
  
  return false;
}

/**
 * Define usuário como premium por 7 dias
 * @param {string} userId - ID do usuário
 * @param {object} paymentData - Dados do pagamento (paymentId, amount, etc)
 */
async function setPremium(userId, paymentData = {}) {
  try {
    const now = new Date();
    const premiumUntil = new Date(now);
    premiumUntil.setDate(premiumUntil.getDate() + PREMIUM_DURATION_DAYS);
    
    await updateUser(userId, {
      premiumUntil: premiumUntil.toISOString(),
      premiumActivatedAt: now.toISOString(),
      paymentData
    });
    
    console.log(`✅ Premium ativado para ${userId} até ${premiumUntil.toISOString()}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao ativar premium:', error);
    return false;
  }
}

/**
 * Verifica se usuário é premium ativo
 * @param {string} userId - ID do usuário
 * @returns {boolean}
 */
async function isPremium(userId) {
  const user = await getUser(userId);
  
  if (!user.premiumUntil) return false;
  
  const now = new Date();
  const premiumEnd = new Date(user.premiumUntil);
  return now <= premiumEnd;
}

/**
 * Obtém status completo do usuário
 * @param {string} userId - ID do usuário
 */
async function getUserStatus(userId) {
  const user = await getUser(userId);
  const now = new Date();
  
  let isPremiumActive = false;
  let daysRemaining = 0;
  
  if (user.premiumUntil) {
    const premiumEnd = new Date(user.premiumUntil);
    isPremiumActive = now <= premiumEnd;
    if (isPremiumActive) {
      daysRemaining = Math.ceil((premiumEnd - now) / (1000 * 60 * 60 * 24));
    }
  }
  
  return {
    userId: user.id,
    isPremium: isPremiumActive,
    premiumUntil: user.premiumUntil,
    daysRemaining,
    freeRemaining: user.freeRemaining,
    canAnalyze: isPremiumActive || user.freeRemaining > 0
  };
}

/**
 * Lista todos os usuários
 */
async function getAllUsers() {
  return await readUsers();
}

// =========================================
// AUTENTICAÇÃO
// =========================================

/**
 * Registrar novo usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha em texto plano
 * @param {string} name - Nome do usuário (opcional)
 * @returns {object|null} Usuário criado ou null se email já existe
 */
async function registerUser(email, password, name = '') {
  try {
    const users = await readUsers();
    
    // Verificar se email já existe
    const existingUser = Object.values(users).find(u => u.email === email);
    if (existingUser) {
      return { error: 'Email já cadastrado' };
    }
    
    // Criar novo usuário
    const userId = 'user_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const passwordHash = hashPassword(password);
    
    users[userId] = {
      id: userId,
      email,
      name,
      passwordHash,
      freeRemaining: FREE_ANALYSES_LIMIT,
      premiumUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await writeUsers(users);
    
    console.log(`✅ Usuário registrado: ${email} (${userId})`);
    
    // Retornar sem senha
    const { passwordHash: _, ...userWithoutPassword } = users[userId];
    return userWithoutPassword;
  } catch (error) {
    console.error('❌ Erro ao registrar usuário:', error);
    return null;
  }
}

/**
 * Autenticar usuário (login)
 * @param {string} email - Email
 * @param {string} password - Senha em texto plano
 * @returns {object|null} { user, token } ou null se falhar
 */
async function authenticateUser(email, password) {
  try {
    const users = await readUsers();
    
    // Buscar usuário por email
    const user = Object.values(users).find(u => u.email === email);
    if (!user) {
      return { error: 'Email ou senha incorretos' };
    }
    
    // Verificar senha
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return { error: 'Email ou senha incorretos' };
    }
    
    // Gerar token de sessão
    const token = generateToken();
    
    // Salvar token no usuário
    users[user.id] = {
      ...user,
      token,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await writeUsers(users);
    
    console.log(`✅ Login bem-sucedido: ${email}`);
    
    // Retornar sem senha
    const { passwordHash: _, ...userWithoutPassword } = users[user.id];
    return {
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('❌ Erro ao autenticar:', error);
    return null;
  }
}

/**
 * Verificar token de sessão
 * @param {string} token - Token de sessão
 * @returns {object|null} Usuário ou null se token inválido
 */
async function verifyToken(token) {
  try {
    const users = await readUsers();
    
    // Buscar usuário com esse token
    const user = Object.values(users).find(u => u.token === token);
    if (!user) {
      return null;
    }
    
    // Retornar sem senha
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    return null;
  }
}

/**
 * Logout (invalidar token)
 * @param {string} userId - ID do usuário
 */
async function logoutUser(userId) {
  try {
    const users = await readUsers();
    
    if (users[userId]) {
      users[userId] = {
        ...users[userId],
        token: null,
        updatedAt: new Date().toISOString()
      };
      
      await writeUsers(users);
      console.log(`✅ Logout: ${userId}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
    return false;
  }
}

/**
 * Buscar usuário por email
 * @param {string} email - Email do usuário
 * @returns {object|null} Usuário ou null
 */
async function getUserByEmail(email) {
  try {
    const users = await readUsers();
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user) return null;
    
    // Retornar sem senha
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário por email:', error);
    return null;
  }
}

export {
  getUser,
  updateUser,
  canAnalyze,
  consumeFreeAnalysis,
  setPremium,
  isPremium,
  getUserStatus,
  getAllUsers,
  // Autenticação
  registerUser,
  authenticateUser,
  verifyToken,
  logoutUser,
  getUserByEmail
};
