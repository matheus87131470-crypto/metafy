/**
 * payments.js
 * Rotas de pagamento PIX via Mercado Pago
 */

const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Payment } = require('mercadopago');
const userStore = require('./lib/userStore');

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});
const payment = new Payment(client);

/**
 * POST /api/payments/pix
 * Cria pagamento PIX
 */
router.post('/pix', async (req, res) => {
  try {
    const { userId, email, amount } = req.body;

    // Validação
    if (!userId || !email || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, email, amount'
      });
    }

    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 1'
      });
    }

    // Criar pagamento PIX
    const paymentData = {
      transaction_amount: parseFloat(amount),
      description: 'Metafy Premium - 7 dias',
      payment_method_id: 'pix',
      payer: {
        email: email,
        first_name: userId,
        identification: {
          type: 'CPF',
          number: '12345678900'
        }
      },
      notification_url: `${process.env.PUBLIC_URL}/api/webhooks/mercadopago`,
      metadata: {
        user_id: userId,
        email: email
      }
    };

    const response = await payment.create({ body: paymentData });

    console.log('✅ Pagamento PIX criado:', {
      payment_id: response.id,
      status: response.status,
      userId,
      email
    });

    // Retornar dados do pagamento
    return res.status(200).json({
      success: true,
      payment_id: response.id,
      status: response.status,
      qr_code: response.point_of_interaction?.transaction_data?.qr_code || null,
      qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      ticket_url: response.point_of_interaction?.transaction_data?.ticket_url || null,
      expiration_date: response.date_of_expiration
    });

  } catch (error) {
    console.error('❌ Erro ao criar pagamento PIX:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create payment',
      message: error.message
    });
  }
});

/**
 * POST /api/webhooks/mercadopago
 * Recebe notificações de pagamento do Mercado Pago
 */
router.post('/webhooks/mercadopago', async (req, res) => {
  try {
    // Mercado Pago envia notificações em diferentes formatos
    let body = req.body;
    
    // Se veio como raw, tentar parsear
    if (Buffer.isBuffer(body)) {
      body = JSON.parse(body.toString());
    }
    
    const { type, data } = body;

    console.log('📩 Webhook recebido:', { type, data });

    // Responder imediatamente ao Mercado Pago (IMPORTANTE)
    res.status(200).send('OK');

    // Processar apenas notificações de pagamento
    if (type !== 'payment') {
      console.log('⚠️ Tipo de notificação ignorado:', type);
      return;
    }

    // Obter ID do pagamento
    const paymentId = data?.id;
    if (!paymentId) {
      console.log('⚠️ Payment ID não encontrado no webhook');
      return;
    }

    // Consultar status do pagamento na API do Mercado Pago
    const paymentInfo = await payment.get({ id: paymentId });
    
    console.log('💳 Status do pagamento:', {
      id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      metadata: paymentInfo.metadata
    });

    // Se pagamento aprovado, liberar premium
    if (paymentInfo.status === 'approved') {
      const userId = paymentInfo.metadata?.user_id;
      const email = paymentInfo.metadata?.email;

      if (!userId) {
        console.log('⚠️ userId não encontrado nos metadata do pagamento');
        return;
      }

      // Ativar premium no arquivo JSON
      const success = await userStore.setPremium(userId, {
        email,
        paymentId: paymentInfo.id,
        amount: paymentInfo.transaction_amount,
        paidAt: new Date().toISOString()
      });

      if (success) {
        console.log('✅ Premium liberado via webhook:', {
          userId,
          email,
          paymentId: paymentInfo.id
        });
      } else {
        console.error('❌ Falha ao salvar premium no arquivo');
      }
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    // Não retornar erro para não fazer o MP reenviar
  }
});

/**
 * GET /api/payments/status/:paymentId
 * Consulta status de um pagamento
 */
router.get('/payments/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Consultar pagamento
    const paymentInfo = await payment.get({ id: paymentId });

    return res.status(200).json({
      success: true,
      payment_id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      transaction_amount: paymentInfo.transaction_amount,
      date_created: paymentInfo.date_created,
      date_approved: paymentInfo.date_approved,
      metadata: paymentInfo.metadata
    });

  } catch (error) {
    console.error('❌ Erro ao consultar pagamento:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get payment status',
      message: error.message
    });
  }
});

/**
 * GET /api/user/:userId
 * Verifica dados de um usuário (para debug)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userStore.getUser(userId);
    const isPremium = await userStore.isPremium(userId);

    return res.status(200).json({
      success: true,
      userId,
      isPremium,
      user
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

/**
 * GET /api/users/all
 * Lista todos os usuários (para debug)
 */
router.get('/users/all', async (req, res) => {
  try {
    const users = await userStore.getAllUsers();

    return res.status(200).json({
      success: true,
      total: Object.keys(users).length,
      users
    });

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to list users'
    });
  }
});

module.exports = router;
