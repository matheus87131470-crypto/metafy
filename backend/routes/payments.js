/**
 * routes/payments.js
 * Rotas de pagamento via Mercado Pago (Checkout Pro)
 */

import express from 'express';
import mercadopagoPkg from 'mercadopago';
const { MercadoPagoConfig, Preference, Payment } = mercadopagoPkg;
import { setPremium, getUser } from '../../lib/userStore.js';

const router = express.Router();

const PREMIUM_PRICE = 3.50; // R$ 3,50
const PREMIUM_DAYS = 7;

// Configurar Mercado Pago
let mercadopago = null;
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 5000 }
    });
    mercadopago = { 
      preference: new Preference(client),
      payment: new Payment(client)
    };
    console.log('✅ Mercado Pago configurado');
  } catch (error) {
    console.error('❌ Erro ao configurar Mercado Pago:', error);
  }
} else {
  console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN não configurado - pagamentos desabilitados');
}

/**
 * POST /api/payments/checkout
 * Cria preferência de pagamento e retorna init_point para redirect
 */
router.post('/checkout', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'userId é obrigatório' }
      });
    }

    // Verificar se Mercado Pago está configurado
    if (!mercadopago) {
      console.warn('⚠️ Tentativa de pagamento sem MP configurado');
      return res.status(503).json({
        success: false,
        error: { message: 'Pagamento temporariamente indisponível' }
      });
    }

    // Verificar se usuário existe
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Usuário não encontrado' }
      });
    }

    // URL base do site
    const baseUrl = process.env.SITE_URL || 'https://metafy.store';
    
    // External reference: premium7|userId|timestamp
    const externalReference = `premium7|${userId}|${Date.now()}`;

    // Criar preferência de pagamento
    const preferenceData = {
      items: [
        {
          title: 'Metafy Premium - 7 dias',
          description: 'Acesso premium com análises ilimitadas por 7 dias',
          quantity: 1,
          unit_price: PREMIUM_PRICE,
          currency_id: 'BRL'
        }
      ],
      external_reference: externalReference,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${baseUrl}?payment=success`,
        failure: `${baseUrl}?payment=failure`,
        pending: `${baseUrl}?payment=pending`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1 // Apenas à vista
      },
      statement_descriptor: 'METAFY PREMIUM',
      metadata: {
        user_id: userId,
        premium_days: PREMIUM_DAYS
      }
    };

    const preference = await mercadopago.preference.create({ body: preferenceData });

    console.log(`✅ Preferência criada para ${userId}: ${preference.id}`);

    res.json({
      success: true,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      preference_id: preference.id,
      external_reference: externalReference
    });

  } catch (error) {
    console.error('❌ Erro ao criar checkout:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erro ao criar checkout',
        details: error.message 
      }
    });
  }
});

/**
 * POST /api/webhooks/mercadopago
 * Webhook do Mercado Pago - processa notificações de pagamento
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Webhook Mercado Pago:', JSON.stringify(req.body, null, 2));
    
    const { type, action, data } = req.body;
    
    // Responder 200 imediatamente
    res.status(200).json({ received: true });

    // Processar apenas notificações de pagamento
    if (type !== 'payment' || action !== 'payment.created' && action !== 'payment.updated') {
      console.log('ℹ️ Notificação ignorada:', type, action);
      return;
    }

    if (!data?.id) {
      console.warn('⚠️ Webhook sem payment ID');
      return;
    }

    // Buscar detalhes do pagamento
    if (!mercadopago) {
      console.error('❌ Mercado Pago não configurado para webhook');
      return;
    }

    const payment = await mercadopago.payment.get({ id: data.id });
    console.log(`📄 Payment ${data.id} status: ${payment.status}`);

    // Processar apenas pagamentos aprovados
    if (payment.status !== 'approved') {
      console.log(`ℹ️ Pagamento ${data.id} não aprovado (${payment.status})`);
      return;
    }

    // Extrair userId do external_reference
    const externalRef = payment.external_reference;
    if (!externalRef || !externalRef.startsWith('premium7|')) {
      console.warn('⚠️ External reference inválido:', externalRef);
      return;
    }

    // Format: premium7|userId|timestamp
    const parts = externalRef.split('|');
    if (parts.length < 2) {
      console.warn('⚠️ External reference mal formatado:', externalRef);
      return;
    }

    const userId = parts[1];
    
    // Ativar premium por 7 dias
    const success = await setPremium(userId, {
      paymentId: payment.id,
      amount: payment.transaction_amount,
      approvedAt: new Date().toISOString(),
      paymentMethod: payment.payment_type_id,
      externalReference: externalRef
    });

    if (success) {
      console.log(`✅ Premium ativado via webhook: ${userId} (payment: ${payment.id})`);
    } else {
      console.error(`❌ Falha ao ativar premium: ${userId}`);
    }

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
  }
});

/**
 * POST /api/payments/simulate-approval
 * [APENAS TESTE] Simula aprovação de pagamento
 */
router.post('/simulate-approval', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }
    
    // Ativar premium
    const success = await setPremium(userId, {
      paymentId: `test_${Date.now()}`,
      amount: PREMIUM_PRICE,
      approvedAt: new Date().toISOString(),
      isSimulation: true
    });
    
    if (success) {
      res.json({
        success: true,
        message: `✅ Premium ativado para ${userId} por ${PREMIUM_DAYS} dias (simulação)`
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao ativar premium'
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao simular aprovação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao simular aprovação'
    });
  }
});

export default router;
