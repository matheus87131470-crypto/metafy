/**
 * userStore.js
 * Persistência simples de usuários em arquivo JSON com paywall
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../data/users.json');
const FREE_ANALYSES_LIMIT = 2; // 2 análises grátis por usuário
const PREMIUM_DURATION_DAYS = 7; // Premium dura 7 dias

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

export {
  getUser,
  updateUser,
  canAnalyze,
  consumeFreeAnalysis,
  setPremium,
  isPremium,
  getUserStatus,
  getAllUsers
};
