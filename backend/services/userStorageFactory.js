/**
 * services/userStorageFactory.js
 * Factory para escolher qual storage usar (JSON ou Firestore)
 * Controlado pela variável de ambiente STORAGE_MODE
 */

import dotenv from 'dotenv';
dotenv.config();

const STORAGE_MODE = process.env.STORAGE_MODE || 'json'; // 'json' | 'firestore'

let storage;

if (STORAGE_MODE === 'firestore') {
  console.log('📦 Usando Firestore para storage de usuários');
  try {
    const firestoreStorage = await import('./userStorageFirestore.js');
    storage = firestoreStorage.default;
  } catch (error) {
    console.error('❌ Erro ao carregar Firestore, usando JSON como fallback:', error.message);
    const jsonStorage = await import('./userStorage.js');
    storage = jsonStorage.default;
  }
} else {
  console.log('📦 Usando JSON (lowdb) para storage de usuários');
  const jsonStorage = await import('./userStorage.js');
  storage = jsonStorage.default;
}

// Exportar funções do storage escolhido
export const {
  getUserData,
  getUserStatus,
  incrementAnalysisUsage,
  updatePremiumStatus,
  resetDailyCounters,
  getStats
} = storage;

export default storage;
