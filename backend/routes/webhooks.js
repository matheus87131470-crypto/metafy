/**
 * routes/webhooks.js
 * Webhook PIX via Asaas
 *
 * Asaas envia POST com:
 * {
 *   "event": "PAYMENT_CONFIRMED" | "PAYMENT_RECEIVED",
 *   "payment": {
 *     "id": "pay_xxx",
 *     "externalReference": "<userId>",
 *     "value": 4.50,
 *     "status": "CONFIRMED",
 *     ...
 *   }
 * }
 */

import express from 'express';
import { setPremium, getUser } from '../../lib/userStore.js';

const router = express.Router();

/**
 * POST /api/webhooks/pix
 * Recebe notificação do Asaas e ativa Premium automaticamente
 */
router.post('/pix', async (req, res) => {
  // Responder 200 imediatamente (Asaas cancela reenvio após 200)
  res.status(200).json({ received: true });

  try {
    const { event, payment } = req.body;

    console.log(`📥 Webhook Asaas [${event}]:`, payment?.id);

    // Processar apenas pagamentos confirmados
    if (event !== 'PAYMENT_RECEIVED' && event !== 'PAYMENT_CONFIRMED') {
      console.log(`ℹ️ Evento ignorado: ${event}`);
      return;
    }

    if (!payment?.externalReference) {
      console.warn('⚠️ Webhook sem externalReference – não é possível identificar o usuário');
      return;
    }

    const userId = payment.externalReference;

    // Verificar se usuário existe
    const user = await getUser(userId);
    if (!user) {
      console.warn(`⚠️ Usuário não encontrado para webhook: ${userId}`);
      return;
    }

    // Evitar ativação dupla
    const now = new Date();
    const alreadyPremium = user.premiumUntil && new Date(user.premiumUntil) > now;
    if (alreadyPremium) {
      console.log(`ℹ️ Usuário ${userId} já é Premium – webhook ignorado`);
      return;
    }

    // Ativar Premium por 7 dias
    const ok = await setPremium(userId, {
      paymentId: payment.id,
      amount: payment.value,
      approvedAt: now.toISOString(),
      paymentMethod: 'PIX',
      provider: 'asaas',
      event
    });

    if (ok) {
      console.log(`✅ Premium ativado via webhook: ${userId} (payment: ${payment.id})`);
    } else {
      console.error(`❌ Falha ao ativar Premium para: ${userId}`);
    }

  } catch (error) {
    console.error('❌ Erro ao processar webhook PIX:', error.message);
  }
});

export default router;
