/**
 * services/userStorage.js
 * Sistema de storage para dados de usuários usando lowdb
 * Timezone: America/Sao_Paulo
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../data/users.json');

// Estrutura padrão do banco
const defaultData = { users: {} };

// Inicializar banco
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

// Ler dados iniciais
await db.read();
db.data ||= defaultData;

/**
 * Obter data atual no timezone de São Paulo (YYYY-MM-DD)
 */
function getTodayBrazil() {
  const now = new Date();
  // Converter para timezone America/Sao_Paulo
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const year = brazilTime.getFullYear();
  const month = String(brazilTime.getMonth() + 1).padStart(2, '0');
  const day = String(brazilTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obter horário de reset (próxima meia-noite de São Paulo em ISO)
 */
function getTomorrowMidnightBrazil() {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  // Próxima meia-noite
  const tomorrow = new Date(brazilTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return tomorrow.toISOString();
}

/**
 * Obter dados do usuário por UID
 * @param {string} uid - Firebase UID
 * @returns {object} Dados do usuário
 */
export function getUserData(uid) {
  db.data.users[uid] ||= createDefaultUser(uid);
  return db.data.users[uid];
}

/**
 * Criar estrutura padrão de usuário
 */
function createDefaultUser(uid) {
  const now = new Date().toISOString();
  return {
    uid,
    isPremium: false,
    premiumUntil: null,
    analysesUsedTotal: 0,
    analysesUsedToday: 0,
    lastAnalysisDate: null, // YYYY-MM-DD (America/Sao_Paulo)
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Obter status do usuário (análises disponíveis, premium, etc)
 */
export function getUserStatus(uid) {
  const user = getUserData(uid);
  const todayBrazil = getTodayBrazil();
  
  // Resetar contador diário se mudou de dia (timezone Brasil)
  if (user.lastAnalysisDate && user.lastAnalysisDate !== todayBrazil) {
    user.analysesUsedToday = 0;
    console.log(`🔄 Resetado contador diário para ${uid}: ${user.lastAnalysisDate} → ${todayBrazil}`);
  }
  
  // Verificar se premium expirou
  if (user.isPremium && user.premiumUntil) {
    const now = new Date();
    const premiumDate = new Date(user.premiumUntil);
    if (now > premiumDate) {
      user.isPremium = false;
      console.log(`⏰ Premium expirado para usuário ${uid}`);
    }
  }
  
  // Calcular análises restantes
  const FREE_DAILY_LIMIT = 2;
  const usedToday = user.analysesUsedToday;
  const remainingToday = user.isPremium 
    ? 999 // Premium ilimitado
    : Math.max(0, FREE_DAILY_LIMIT - usedToday);
  
  return {
    isPremium: user.isPremium,
    premiumUntil: user.premiumUntil,
    usedToday,
    remainingToday,
    analysesUsedTotal: user.analysesUsedTotal,
    canAnalyze: remainingToday > 0
  };
}

/**
 * Incrementar uso de análise
 * @returns {object} Status atualizado
 */
export async function incrementAnalysisUsage(uid) {
  const user = getUserData(uid);
  const status = getUserStatus(uid);
  
  // Verificar se pode analisar
  if (!status.canAnalyze) {
    const error = new Error('Limite de 2 análises gratuitas por dia atingido. Faça upgrade para Premium!');
    error.code = 'DAILY_LIMIT';
    error.usedToday = status.usedToday;
    error.remainingToday = status.remainingToday;
    error.resetAt = getTomorrowMidnightBrazil();
    throw error;
  }
  
  const todayBrazil = getTodayBrazil();
  const now = new Date();
  
  // Atualizar contadores
  user.analysesUsedToday += 1;
  user.analysesUsedTotal += 1;
  user.lastAnalysisDate = todayBrazil; // Armazenar data Brasil (YYYY-MM-DD)
  user.updatedAt = now.toISOString();
  
  // Salvar no banco
  await db.write();
  
  const remaining = status.isPremium ? '∞' : `${2 - user.analysesUsedToday}`;
  console.log(`📊 Análise registrada para ${uid}: ${user.analysesUsedToday}/2 hoje (${remaining} restantes)`);
  
  return getUserStatus(uid);
}

/**
 * Atualizar status premium do usuário
 */
export async function updatePremiumStatus(uid, isPremium, premiumUntil = null) {
  const user = getUserData(uid);
  
  user.isPremium = isPremium;
  user.premiumUntil = premiumUntil;
  user.updatedAt = new Date().toISOString();
  
  await db.write();
  
  console.log(`💎 Premium atualizado para ${uid}: ${isPremium ? 'ATIVO até ' + premiumUntil : 'INATIVO'}`);
  
  return getUserStatus(uid);
}

/**
 * Resetar contadores diários (pode ser usado em cronjob)
 */
export async function resetDailyCounters() {
  const users = db.data.users;
  let resetCount = 0;
  
  for (const uid in users) {
    if (users[uid].analysesUsedToday > 0) {
      users[uid].analysesUsedToday = 0;
      resetCount++;
    }
  }
  
  await db.write();
  console.log(`🔄 Resetados ${resetCount} contadores diários`);
}

/**
 * Obter todas as estatísticas
 */
export function getStats() {
  const users = Object.values(db.data.users);
  
  return {
    totalUsers: users.length,
    premiumUsers: users.filter(u => u.isPremium).length,
    freeUsers: users.filter(u => !u.isPremium).length,
    totalAnalyses: users.reduce((sum, u) => sum + u.analysesUsedTotal, 0),
    analyseesToday: users.reduce((sum, u) => sum + u.analysesUsedToday, 0)
  };
}

export default {
  getUserData,
  getUserStatus,
  incrementAnalysisUsage,
  updatePremiumStatus,
  resetDailyCounters,
  getStats
};
