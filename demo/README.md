# Demo Checkout - Centralizador de Gateways PIX

Demo em Next.js que demonstra um fluxo completo de checkout com integração em tempo real via SSE.

## 🚀 Como executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar API
Certifique-se de que a API principal esteja rodando na porta 5000:
```bash
# Na pasta raiz do projeto
npm run dev
```

### 3. Executar demo
```bash
# Na pasta demo/
npm run dev
```

A demo estará disponível em: http://localhost:3000

## 📦 Funcionalidades

### Página Principal (`/`)
- Lista de 10 produtos mockados
- Cards com preços fixos (evita erro de hidratação)
- Link para checkout de cada produto

### Página de Checkout (`/checkout/[id]`)
- **Etapa 1**: Formulário de dados do cliente (opcional - usa padrão se vazio)
- **Etapa 2**: Criação do pagamento PIX via PayEvo (`POST /pix/payevo`)
- **Etapa 3**: Conexão SSE (`GET /pix/sse/payevo/:id`) aguardando confirmação
- **Etapa 4**: Upsell com produtos relacionados após pagamento confirmado

## 🔧 Integração com API

### Endpoints utilizados:
- `POST ${API_URL}/pix/payevo` - Criação de pagamento
- `GET ${API_URL}/pix/sse/payevo/:id` - Server-Sent Events para status

### Variáveis de ambiente:
- `NEXT_PUBLIC_API_URL` - URL da API (padrão: http://localhost:5000)

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS 3.x** - Estilização
- **Server-Sent Events** - Notificações em tempo real

## 📝 Fluxo de Pagamento

1. **Seleção**: Usuário escolhe produto na lista
2. **Dados**: Preenche formulário (nome, email, telefone opcional)
3. **Pagamento**: Sistema cria PIX via PayEvo
4. **Aguardo**: Conexão SSE monitora status do pagamento
5. **Confirmação**: Quando status contém `PAID|COMPLETED|SUCCESS|SUCCEEDED`
6. **Upsell**: Exibe produtos relacionados para compra adicional

## 🐛 Correções Aplicadas

- **Erro de hidratação**: Substituído `Math.random()` por preços fixos
- **PostCSS**: Atualizado para Tailwind CSS 3.x compatível
- **SSE**: Implementado com reconexão automática e cleanup

## 🧪 Para testar pagamento completo

1. Execute a API principal (`npm run dev` na raiz)
2. Execute a demo (`npm run dev` na pasta demo/)
3. Use ngrok ou similar para expor webhooks (se necessário)
4. Configure credenciais PayEvo no `.env` da API principal

---

**Nota**: Esta é uma demonstração. Em produção, adicione validações de segurança, tratamento de erros mais robusto e autenticação adequada.