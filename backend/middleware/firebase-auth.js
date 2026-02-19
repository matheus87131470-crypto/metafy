/**
 * middleware/firebase-auth.js
 * Middleware de autenticação usando Firebase Admin SDK
 */

import admin from 'firebase-admin';

// Inicializar Firebase Admin (apenas uma vez)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "metafy-1a1d4",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    console.log('✅ Firebase Admin inicializado');
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  }
}

/**
 * Middleware que verifica Firebase ID Token
 * Anexa usuário em req.user se válido
 */
export async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
        needAuth: true
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token com Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Anexar dados do usuário à requisição
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar token Firebase:', error.message);
    
    // Diferenciar tipos de erro
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado. Por favor, faça login novamente.',
        needAuth: true,
        tokenExpired: true
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        needAuth: true
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Falha na autenticação',
      needAuth: true
    });
  }
}

/**
 * Middleware opcional - tenta autenticar mas não bloqueia se falhar
 */
export async function optionalFirebaseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        emailVerified: decodedToken.email_verified
      };
    }
  } catch (error) {
    // Silenciosamente ignora erro - usuário não autenticado
    console.log('⚠️ Auth opcional falhou (ok):', error.message);
  }
  
  next();
}

export default admin;
