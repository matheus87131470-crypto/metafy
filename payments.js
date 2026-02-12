/**
 * payments.js
 * Rotas de pagamento PIX via Mercado Pago
 */

const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Payment } = require('mercadopago');

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});
const payment = new Payment(client);

// Simulação de banco de dados de usuários (você deve substituir por seu DB real)
const users = new Map();

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

    // Armazenar referência do usuário ao pagamento
    users.set(response.id.toString(), {
      userId,
      email,
      status: 'pending',
      createdAt: new Date()
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
router.post('/mercadopago', async (req, res) => {
  try {
    // Mercado Pago envia notificações em diferentes formatos
    const { type, data } = req.body;

    console.log('📩 Webhook recebido:', { type, data });

    // Responder imediatamente ao Mercado Pago
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
      status_detail: paymentInfo.status_detail
    });

    // Se pagamento aprovado, liberar premium
    if (paymentInfo.status === 'approved') {
      const userData = users.get(paymentId.toString());
      
      if (userData) {
        const userId = userData.userId;
        const email = userData.email;

        // Atualizar usuário como premium
        // IMPORTANTE: Substitua isso pela lógica do seu banco de dados
        users.set(paymentId.toString(), {
          ...userData,
          status: 'approved',
          premium: true,
          premiumSince: new Date(),
          approvedAt: new Date()
        });

        console.log('✅ Premium ativado para usuário:', {
          userId,
          email,
          paymentId
        });

        // TODO: Aqui você deve:
        // 1. Atualizar seu banco de dados
        // 2. Enviar email de confirmação
        // 3. Notificar o frontend via WebSocket/etc
        
        // Exemplo de como seria com um DB real:
        /*
        await User.updateOne(
          { userId: userId },
          {
            premium: true,
            premiumSince: new Date(),
            premiumEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        );
        */
      } else {
        console.log('⚠️ Dados do usuário não encontrados para payment:', paymentId);
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
router.get('/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Consultar pagamento
    const paymentInfo = await payment.get({ id: paymentId });

    // Verificar dados locais
    const userData = users.get(paymentId);

    return res.status(200).json({
      success: true,
      payment_id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      transaction_amount: paymentInfo.transaction_amount,
      date_created: paymentInfo.date_created,
      date_approved: paymentInfo.date_approved,
      user_data: userData || null
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
 * GET /api/payments/check-premium/:userId
 * Verifica se usuário é premium
 */
router.get('/check-premium/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    // Procurar usuário em todos os pagamentos
    let isPremium = false;
    let premiumData = null;

    for (const [paymentId, data] of users.entries()) {
      if (data.userId === userId && data.premium === true) {
        isPremium = true;
        premiumData = {
          paymentId,
          premiumSince: data.premiumSince,
          email: data.email
        };
        break;
      }
    }

    return res.status(200).json({
      success: true,
      userId,
      isPremium,
      data: premiumData
    });

  } catch (error) {
    console.error('❌ Erro ao verificar premium:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check premium status'
    });
  }
});

module.exports = router;
