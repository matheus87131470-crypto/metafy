# Configuração Firebase Admin SDK - Backend

## 📋 Pré-requisitos

O backend agora usa **Firebase Admin SDK** para validar tokens de autenticação e gerenciar o sistema de paywall.

## 🔑 Como obter as credenciais

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto **metafy-1a1d4**
3. Vá em **⚙️ Configurações do Projeto** (ícone de engrenagem)
4. Clique na aba **Contas de serviço**
5. Clique em **Gerar nova chave privada**
6. Um arquivo JSON será baixado

## 🛠️ Configuração no Render

### Variáveis de Ambiente

Adicione as seguintes variáveis no painel do Render:

```
FIREBASE_PROJECT_ID=metafy-1a1d4
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@metafy-1a1d4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----\n"
```

### Valores do arquivo JSON baixado

No arquivo JSON que você baixou, encontre:

- `project_id` → **FIREBASE_PROJECT_ID**
- `client_email` → **FIREBASE_CLIENT_EMAIL**  
- `private_key` → **FIREBASE_PRIVATE_KEY**

⚠️ **IMPORTANTE**: A `FIREBASE_PRIVATE_KEY` deve estar entre aspas duplas e com os `\n` preservados.

## 📁 Estrutura de Dados

O sistema cria automaticamente o arquivo `backend/data/users.json` para armazenar:

```json
{
  "users": {
    "firebase-uid-123": {
      "uid": "firebase-uid-123",
      "isPremium": false,
      "premiumUntil": null,
      "analysesUsedTotal": 5,
      "analysesUsedToday": 2,
      "lastAnalysisDate": "2026-02-19T10:30:00.000Z",
      "createdAt": "2026-02-19T08:00:00.000Z",
      "updatedAt": "2026-02-19T10:30:00.000Z"
    }
  }
}
```

## 🔒 Sistema de Paywall

### Limites

- **Free**: 2 análises por dia
- **Premium**: Ilimitado até `premiumUntil`

### Fluxo de Autenticação

1. Usuário faz login com Google no frontend
2. Frontend obtém `idToken` do Firebase Auth
3. Frontend envia token no header: `Authorization: Bearer {token}`
4. Backend valida token com Firebase Admin SDK
5. Backend verifica limite de análises
6. Backend permite ou bloqueia a análise

### Endpoints

- `GET /api/user/status` - Status do usuário (análises restantes, premium, etc)
- `POST /api/user/analysis/use` - Registra uso de análise e valida limite
- `POST /api/user/premium` - Atualiza status premium (webhooks)
- `GET /api/user/stats` - Estatísticas gerais (admin)

## 🧪 Testes Locais

```bash
cd backend
npm install
npm start
```

Para testar autenticação:

```bash
# Obter um token do frontend (console do navegador)
await firebase.auth().currentUser.getIdToken()

# Testar endpoint
curl -X GET http://localhost:3000/api/user/status \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🚀 Deploy

Após configurar as variáveis de ambiente no Render:

```bash
git add .
git commit -m "feat: implementar paywall com Firebase Admin SDK"
git push
```

O Render fará o deploy automaticamente.

## 🔍 Validação

Verifique nos logs do Render:

```
✅ Firebase Admin inicializado
🚀 Metafy Backend rodando na porta 3000
```

Se aparecer erro, verifique se as variáveis de ambiente estão corretas.
