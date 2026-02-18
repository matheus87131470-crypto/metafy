/**
 * routes/payments.js
 * Rotas de pagamento via Mercado Pago
 */

import express from 'express';
import { setPremium } from '../../lib/userStore.js';

const router = express.Router();

const PREMIUM_PRICE = 3.50; // R$ 3,50

/**
 * POST /api/payments/create
 * Cria pagamento no Mercado Pago
 */
router.post('/create', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }
    
    // Verificar se tem access token do Mercado Pago
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN não configurado');
      return res.status(503).json({
        success: false,
        error: 'Pagamento temporariamente indisponível',
        message: 'Configuração do Mercado Pago pendente'
      });
    }
    
    // TODO: Integrar com SDK do Mercado Pago
    // Por enquanto, retornar estrutura mock
    const paymentData = {
      paymentId: `mp_${userId}_${Date.now()}`,
      amount: PREMIUM_PRICE,
      currency: 'BRL',
      status: 'pending',
      // Em produção, criar preferência real:
      // const preference = await mercadopago.preferences.create({...})
      checkoutUrl: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_${userId}`,
      qrCode: null, // QR Code PIX será gerado pelo MP
      qrCodeBase64: null
    };
    
    res.json({
      success: true,
      payment: paymentData,
      message: 'Pagamento criado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar pagamento'
    });
  }
});

/**
 * POST /api/webhooks/mercadopago
 * Webhook do Mercado Pago (notificação de pagamento)
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Webhook Mercado Pago recebido:', req.body);
    
    const { type, data } = req.body;
    
    // Verificar se é notificação de pagamento aprovado
    if (type === 'payment' && data?.id) {
      // TODO: Buscar detalhes do pagamento via API do MP
      // const payment = await mercadopago.payment.get(data.id);
      
      // Mock: assumir aprovado para testar
      const paymentStatus = 'approved'; // payment.status
      const userId = 'mock_user'; // extrair do metadata do pagamento
      
      if (paymentStatus === 'approved') {
        // Ativar premium por 7 dias
        await setPremium(userId, {
          paymentId: data.id,
          amount: PREMIUM_PRICE,
          approvedAt: new Date().toISOString()
        });
        
        console.log(`✅ Premium ativado via webhook para usuário ${userId}`);
      }
    }
    
    // Sempre responder 200 OK para o webhook
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    // Ainda assim responder 200 para não reenviar
    res.status(200).json({ received: false, error: error.message });
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
        message: `Premium ativado para ${userId} por 7 dias (simulação)`
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
