# 🔥 Firestore Setup - Storage Oficial do Metafy

## ⚠️ IMPORTANTE: users.json NÃO é persistente no Render

O arquivo `backend/data/users.json` está dentro do **container Docker do Render**.

**Problema:** A cada redeploy ou restart, o container é recriado e **todos os dados são perdidos**.

**Solução:** Migrar para **Firestore** (banco de dados em nuvem persistente).

---

## 🚀 Ativar Firestore como Storage Oficial

### 1️⃣ Configurar Firestore no Firebase Console

1. Acesse https://console.firebase.google.com/
2. Selecione seu projeto **metafy-1a1d4**
3. No menu lateral, clique em **Firestore Database**
4. Clique em **Criar banco de dados**
5. Escolha:
   - **Modo de produção** (mais seguro)
   - **Localização:** `southamerica-east1` (São Paulo - menor latência)
6. Aguarde a criação (leva ~1 minuto)

### 2️⃣ Configurar Regras de Segurança do Firestore

No console do Firestore, vá em **Regras** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas o backend (Firebase Admin SDK) pode acessar
    match /users/{userId} {
      allow read, write: if false; // Bloqueia acesso direto do frontend
    }
  }
}
```

**Por que?** O backend usa Firebase Admin SDK (tem permissões totais), mas bloqueia acesso direto do frontend.

### 3️⃣ Configurar Variáveis de Ambiente no Render

As credenciais do Firebase Admin **já existem** no `.env`:

```env
FIREBASE_PROJECT_ID=metafy-1a1d4
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@metafy-1a1d4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Adicione apenas:**

```env
STORAGE_MODE=firestore
```

No painel do Render:
1. Vá em **Environment** → **Environment Variables**
2. Adicione: `STORAGE_MODE` = `firestore`
3. Clique em **Save Changes**
4. O Render fará redeploy automaticamente

---

## 📊 Estrutura da Coleção `users`

Cada documento tem o **Firebase UID** como ID:

```javascript
// Documento: users/{uid}
{
  uid: "firebase-uid-123",
  isPremium: false,
  premiumUntil: null,
  analysesUsedTotal: 5,
  analysesUsedToday: 2,
  lastAnalysisDate: "2026-02-20", // YYYY-MM-DD (timezone Brasil)
  createdAt: "2026-02-19T08:00:00.000Z",
  updatedAt: "2026-02-20T10:30:00.000Z"
}
```

---

## ✅ Como o Firestore Funciona

### Criar/Atualizar Usuário
- Primeiro login → cria documento automaticamente
- A cada análise → atualiza contadores

### Transações Atômicas
```javascript
// Impede race conditions (2 análises simultâneas)
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
```

### Reset Diário Automático
- Ao buscar status, verifica se `lastAnalysisDate !== today`
- Se mudou de dia → reseta `analysesUsedToday = 0`

---

## 🔍 Verificar Funcionamento

### Logs do Render

Após deploy, procure nos logs:

```
✅ Firebase Admin inicializado
✅ Firestore inicializado
📦 Usando Firestore para storage de usuários
```

### Testar Endpoints

```bash
# 1. Login no frontend e pegar token
# No console do navegador: await firebase.auth().currentUser.getIdToken()

# 2. Testar status
curl -X GET https://metafy-backend.onrender.com/api/user/status \
  -H "Authorization: Bearer SEU_TOKEN"

# Resposta esperada:
{
  "success": true,
  "user": { "uid": "...", "email": "..." },
  "isPremium": false,
  "usedToday": 0,
  "remainingToday": 2,
  "canAnalyze": true
}
```

### Verificar no Firestore Console

1. Firestore Database → Coleção `users`
2. Você verá os documentos criados automaticamente
3. Cada usuário que fizer login aparecerá aqui

---

## 📈 Firestore vs JSON (lowdb)

| Característica | JSON (lowdb) | Firestore |
|---|---|---|
| **Persistência** | ❌ Perdida em redeploy | ✅ Banco em nuvem |
| **Escalabilidade** | ❌ Até ~10k usuários | ✅ Milhões de usuários |
| **Concorrência** | ❌ Sem proteção | ✅ Transações atômicas |
| **Custo** | ✅ Grátis | ✅ Free tier: 50k reads/day |
| **Complexidade** | ✅ Simples | ⚠️ Requer configuração |
| **Backup** | ❌ Manual | ✅ Automático |

---

## 💰 Custos do Firestore (Free Tier)

**Plano Spark (gratuito):**
- 50.000 leituras/dia
- 20.000 escritas/dia
- 1 GB de armazenamento

**Para Metafy:**
- Cada análise = 2 leituras + 1 escrita
- Com 2 análises/usuário/dia:
  - 100 usuários/dia = 400 leituras + 200 escritas ✅ OK
  - 500 usuários/dia = 2000 leituras + 1000 escritas ✅ OK
  - 10k usuários/dia = 40k leituras + 20k escritas ✅ OK (no limite)

**Quando precisar pagar:** ~50k+ usuários ativos/dia

---

## 🔄 Rollback (Voltar para JSON)

Se algo der errado:

```bash
# No Render Environment:
STORAGE_MODE=json

# Redeploy
```

O sistema volta para `users.json` automaticamente.

---

## 🎯 Checklist de Ativação

- [ ] Firestore Database criado no Firebase Console
- [ ] Regras de segurança configuradas
- [ ] Variável `STORAGE_MODE=firestore` adicionada no Render
- [ ] Deploy feito e logs verificados
- [ ] Teste: fazer login e verificar documento criado no Firestore
- [ ] Teste: fazer 2 análises e verificar contadores atualizados
- [ ] Teste: 3ª análise bloqueada com mensagem de reset

---

## 📞 Troubleshooting

### Erro: "Firestore não disponível"
**Causa:** Credenciais Firebase incorretas  
**Solução:** Verificar `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

### Erro: "Permission denied"
**Causa:** Regras do Firestore muito restritivas  
**Solução:** Firebase Admin SDK ignora regras. Verifique se o Admin foi inicializado corretamente.

### Erro: "users.json sendo usado ainda"
**Causa:** `STORAGE_MODE` não foi setado ou está como `json`  
**Solução:** Verificar Environment Variables no Render

---

**🎉 Pronto! Com Firestore ativo, o sistema está pronto para produção escalável!**
