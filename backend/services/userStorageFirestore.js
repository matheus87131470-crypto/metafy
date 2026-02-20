/**
 * services/userStorageFirestore.js
 * Sistema de storage para dados de usuários usando Firestore
 * Timezone: America/Sao_Paulo
 * 
 * TODO: Implementar quando migrar para produção escalável
 * Interface mantida 100% compatível com userStorage.js
 */

import admin from '../middleware/firebase-auth.js';

// Inicializar Firestore
let db;
try {
  db = admin.firestore();
  console.log('✅ Firestore inicializado');
} catch (error) {
  console.warn('⚠️ Firestore não disponível:', error.message);
}

const USERS_COLLECTION = 'users';

/**
 * Obter data atual no timezone de São Paulo (YYYY-MM-DD)
 */
function getTodayBrazil() {
  const now = new Date();
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
 * @returns {Promise<object>} Dados do usuário
 */
export async function getUserData(uid) {
  const docRef = db.collection(USERS_COLLECTION).doc(uid);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    // Criar usuário com valores padrão
    const userData = createDefaultUser(uid);
    await docRef.set(userData);
    return userData;
  }
  
  return doc.data();
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
export async function getUserStatus(uid) {
  const user = await getUserData(uid);
  const todayBrazil = getTodayBrazil();
  
  // Resetar contador diário se mudou de dia (timezone Brasil)
  if (user.lastAnalysisDate && user.lastAnalysisDate !== todayBrazil) {
    user.analysesUsedToday = 0;
    await db.collection(USERS_COLLECTION).doc(uid).update({
      analysesUsedToday: 0
    });
    console.log(`🔄 Resetado contador diário para ${uid}: ${user.lastAnalysisDate} → ${todayBrazil}`);
  }
  
  // Verificar se premium expirou
  if (user.isPremium && user.premiumUntil) {
    const now = new Date();
    const premiumDate = new Date(user.premiumUntil);
    if (now > premiumDate) {
      user.isPremium = false;
      await db.collection(USERS_COLLECTION).doc(uid).update({
        isPremium: false
      });
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
 * @returns {Promise<object>} Status atualizado
 */
export async function incrementAnalysisUsage(uid) {
  const status = await getUserStatus(uid);
  
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
  
  // Atualizar contadores usando transação para evitar race conditions
  const docRef = db.collection(USERS_COLLECTION).doc(uid);
  
  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    const user = doc.data();
    
    transaction.update(docRef, {
      analysesUsedToday: user.analysesUsedToday + 1,
      analysesUsedTotal: user.analysesUsedTotal + 1,
      lastAnalysisDate: todayBrazil,
      updatedAt: now.toISOString()
    });
  });
  
  const remaining = status.isPremium ? '∞' : `${2 - (status.usedToday + 1)}`;
  console.log(`📊 Análise registrada para ${uid}: ${status.usedToday + 1}/2 hoje (${remaining} restantes)`);
  
  return await getUserStatus(uid);
}

/**
 * Atualizar status premium do usuário
 */
export async function updatePremiumStatus(uid, isPremium, premiumUntil = null) {
  const now = new Date().toISOString();
  
  await db.collection(USERS_COLLECTION).doc(uid).update({
    isPremium,
    premiumUntil,
    updatedAt: now
  });
  
  console.log(`💎 Premium atualizado para ${uid}: ${isPremium ? 'ATIVO até ' + premiumUntil : 'INATIVO'}`);
  
  return await getUserStatus(uid);
}

/**
 * Resetar contadores diários (pode ser usado em cronjob)
 */
export async function resetDailyCounters() {
  const usersSnapshot = await db.collection(USERS_COLLECTION)
    .where('analysesUsedToday', '>', 0)
    .get();
  
  const batch = db.batch();
  let resetCount = 0;
  
  usersSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, { analysesUsedToday: 0 });
    resetCount++;
  });
  
  await batch.commit();
  console.log(`🔄 Resetados ${resetCount} contadores diários`);
}

/**
 * Obter todas as estatísticas
 */
export async function getStats() {
  const usersSnapshot = await db.collection(USERS_COLLECTION).get();
  const users = usersSnapshot.docs.map(doc => doc.data());
  
  return {
    totalUsers: users.length,
    premiumUsers: users.filter(u => u.isPremium).length,
    freeUsers: users.filter(u => !u.isPremium).length,
    totalAnalyses: users.reduce((sum, u) => sum + (u.analysesUsedTotal || 0), 0),
    analyseesToday: users.reduce((sum, u) => sum + (u.analysesUsedToday || 0), 0)
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
