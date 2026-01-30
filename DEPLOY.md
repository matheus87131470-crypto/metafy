# 🚀 Guia de Deploy - Metafy

## Deploy na Vercel (Automático)

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com)
- Repositório já configurado

### Passos

1. **Acesse Vercel Dashboard**
   - Vá para https://vercel.com/dashboard

2. **Clique em "New Project"**
   - Conecte seu GitHub
   - Autorize o Vercel

3. **Selecione o repositório `metafy`**
   - Clique em "Import"

4. **Configure o Projeto**
   - Project Name: `metafy` (ou seu nome)
   - Framework: `Other`
   - Root Directory: `.` (raiz)
   - Build Command: deixar em branco
   - Output Directory: `.`

5. **Clique em "Deploy"**
   - Aguarde o deploy finalizar (~30s)
   - URL será gerada automaticamente

### URL Gerada
```
https://metafy.vercel.app
```

## Deploy Automático

Toda vez que você fazer `git push` para a branch `main`, a Vercel automaticamente:
1. Detecta o push
2. Faz build do projeto
3. Faz deploy em produção

## Verificar Status do Deploy

1. Acesse o dashboard da Vercel
2. Clique no projeto `metafy`
3. Veja os deploys recentes em "Deployments"

## Verificar Logs

```
Vercel Dashboard > Deployments > [Seu Deploy] > Logs
```

## Domínio Customizado

Para usar um domínio customizado:

1. Vá em Project Settings > Domains
2. Clique em "Add"
3. Digite seu domínio
4. Siga as instruções de DNS

## Variáveis de Ambiente (se necessário no futuro)

1. Project Settings > Environment Variables
2. Adicione suas variáveis
3. Re-deploy automático

## Troubleshooting

### Erro 404 ao acessar
- Certifique-se que `index.html` está na raiz
- Verificar que não há build command

### Deploy não inicia
- Verifique se há erros no git push
- Veja os logs no dashboard da Vercel

### Dados não aparecem
- Limpar cache do navegador (Ctrl+Shift+Del)
- Abrir em modo anônimo

## Comandos Git

```bash
# Ver status
git status

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "descrição das mudanças"

# Fazer push
git push origin main
```

## Próximas Melhorias

- [ ] Backend Node.js/Python
- [ ] Autenticação Firebase
- [ ] Banco de dados Supabase
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Integração com Stripe (pagamentos)

---

**Status**: ✅ Pronto para produção na Vercel
