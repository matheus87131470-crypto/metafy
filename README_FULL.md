# Metafy - Dashboard de Metas

Dashboard moderno e responsivo para criar, acompanhar e conquistar seus objetivos pessoais e profissionais.

## 🎯 Características

- **Medidores Semicirculares Animados** - Visualize seu progresso com animações suaves
- **Glassmorphism Design** - Interface moderna e translúcida com blur effect
- **Dark Theme Professional** - Visual limpo e elegante no padrão SaaS
- **Totalmente Responsivo** - Funciona perfeitamente em desktop e mobile
- **100% Frontend** - Sem dependências externas, rápido e leve
- **Local Storage** - Dados salvos automaticamente no navegador
- **Sistema de Notificações** - Feedback visual em tempo real

## 🚀 Tecnologias

- HTML5
- CSS3 (Glassmorphism, Gradientes, Animações)
- JavaScript Vanilla (sem dependências)
- Canvas para gráficos

## 📦 Instalação

### Opção 1: Clonar repositório
```bash
git clone https://github.com/matheus87131470-crypto/metafy.git
cd metafy
```

### Opção 2: Usar arquivo local
Abra `index.html` diretamente no navegador ou use um servidor local:

```bash
# Python 3
python -m http.server 8000

# ou Node.js
npx http-server -p 8000
```

Acesse: `http://localhost:8000`

## 💡 Como Usar

1. **Clique em "+ Criar Meta"** no header
2. **Preencha os dados:**
   - Título da meta
   - Tipo (Dinheiro, Percentual, Tarefas, Custom)
   - Valor alvo
   - Valor atual
   - Data inicial e final
3. **Clique em "Salvar Meta"**
4. **Veja o progresso** em tempo real com o medidor animado

## 📱 Estrutura de Metas

Cada meta possui:
- **ID único** para identificação
- **Tipo** (money, percentage, tasks, custom)
- **Valores** (current, target)
- **Datas** (startDate, endDate)
- **Histórico** de progresso

## 🎨 Cores & Design

- **Dark Background**: #0a0e27
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #ec4899 (Pink)
- **Accent**: #14b8a6 (Teal)

## 📊 API JavaScript

Use no console do navegador:

```javascript
// Carregar dados de exemplo
loadDemoData()

// Atualizar progresso de uma meta
updateGoalProgress('goalId', 85)

// Obter todas as metas
getAllGoals()

// Exportar metas em JSON
exportGoals()

// Deletar todos os dados
clearAllData()
```

## 🔧 Desenvolvimento

### Estrutura de Arquivos
```
├── index.html           # Página principal
├── styles.css           # Estilos globais
├── gauge.js             # Componente de medidor
├── goals.js             # Sistema de metas
├── main.js              # Lógica principal
├── notifications.js     # Sistema de toasts
├── demo-data.js         # Dados de exemplo
├── README.md            # Documentação
└── vercel.json          # Config Vercel
```

### Adicionando Funcionalidades

1. **Histórico de Progresso**: Expandir `goal.history`
2. **Streaks**: Contar dias seguidos completados
3. **Badges**: Sistema de conquistas
4. **Backend**: Integrar API Node.js/Python
5. **Autenticação**: Firebase/Auth0
6. **Pagamentos**: Stripe/MercadoPago

## 🌐 Deploy

### Vercel (Recomendado)

O projeto está configurado para deploy automático na Vercel:

1. Conecte seu repositório GitHub
2. Configure as Environment Variables (se necessário)
3. A Vercel fará deploy automático a cada `git push`

**URL**: https://metafy.vercel.app (ou seu domínio)

### Outras Plataformas

- **Netlify**: Arraste a pasta para o Netlify Drop
- **GitHub Pages**: Habilite em Settings > Pages
- **Firebase Hosting**: `firebase deploy`

## 📝 Licença

MIT - Sinta-se livre para usar e modificar

## 👨‍💻 Autor

Matheus Crypto - [@github](https://github.com/matheus87131470-crypto)

---

**Status**: ✅ Pronto para produção
**Última atualização**: 30 de Janeiro de 2026
