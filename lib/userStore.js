/**
 * userStore.js
 * Persistência simples de usuários em arquivo JSON
 */

const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

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
 * Obtém dados de um usuário
 * @param {string} userId - ID do usuário
 * @returns {object} Dados do usuário ou objeto vazio
 */
async function getUser(userId) {
  const users = await readUsers();
  return users[userId] || {};
}

/**
 * Define usuário como premium
 * @param {string} userId - ID do usuário
 * @param {object} premiumData - Dados adicionais (paymentId, etc)
 */
async function setPremium(userId, premiumData = {}) {
  try {
    const users = await readUsers();
    
    // Calcular data de expiração (7 dias)
    const premiumSince = new Date();
    const premiumEnd = new Date(premiumSince);
    premiumEnd.setDate(premiumEnd.getDate() + 7);
    
    users[userId] = {
      ...users[userId],
      userId,
      premium: true,
      premiumSince: premiumSince.toISOString(),
      premiumEnd: premiumEnd.toISOString(),
      updatedAt: new Date().toISOString(),
      ...premiumData
    };
    
    const success = await writeUsers(users);
    
    if (success) {
      console.log('✅ Premium ativado:', {
        userId,
        premiumSince: premiumSince.toISOString(),
        premiumEnd: premiumEnd.toISOString()
      });
    }
    
    return success;
  } catch (error) {
    console.error('❌ Erro ao definir premium:', error);
    return false;
  }
}

/**
 * Verifica se usuário é premium e ainda não expirou
 * @param {string} userId - ID do usuário
 * @returns {boolean}
 */
async function isPremium(userId) {
  const user = await getUser(userId);
  
  if (!user.premium) return false;
  
  // Verificar se não expirou
  if (user.premiumEnd) {
    const now = new Date();
    const end = new Date(user.premiumEnd);
    return now <= end;
  }
  
  return false;
}

/**
 * Lista todos os usuários
 */
async function getAllUsers() {
  return await readUsers();
}

module.exports = {
  getUser,
  setPremium,
  isPremium,
  getAllUsers
};
