# Centralizador de Gateways PIX

API para centralizar múltiplos gateways de pagamento PIX, fornecendo uma interface unificada para criação e consulta de cobranças PIX com notificações em tempo real.

## 🚀 Características

- **Interface unificada**: Padroniza a comunicação com diferentes gateways
- **Failover automático**: Se um gateway falhar, tenta o próximo automaticamente  
- **Validação robusta**: Validação completa dos dados de entrada
- **Tratamento de erros**: Respostas padronizadas para diferentes tipos de erro
- **Suporte a múltiplos gateways**: PayEvo, BlackCat (facilmente extensível)
- **Server-Sent Events (SSE)**: Notificações em tempo real sobre mudanças de status
- **Webhooks**: Recebe e processa callbacks dos gateways automaticamente
- **Dashboard de Testes**: Interface web para teste das funcionalidades SSE## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## ⚡ Instalação e execução

```bash
# Instalar dependências
npm install

# Copiar arquivo de configuração
copy .env.example .env

# Executar em modo desenvolvimento
npm run dev

# Executar em produção
npm start
```

## 🛠 API Endpoints

### POST /pix
Cria uma nova cobrança PIX

**Request Body:**
```json
{
    "currency": "BRL",
    "amount": 10000,
    "items": [
        {
            "title": "something",
            "unitPrice": 10000,
            "quantity": 1,
            "tangible": false
        }
    ],
    "customer": {
        "name": "Fulano de Tal",
        "email": "fulano@gmail.com",
        "document": {
            "number": "00000000000",
            "type": "cpf"
        }
    }
}
```

**Response:**
```json
{
    "qrcode": "00020101021226580014BR.GOV.BCB.PIX...",
    "expirationDate": "2024-01-01T00:30:00.000Z",
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "PENDING"
}
```

### GET /pix/:id
Consulta o status de uma cobrança PIX

**Response:**
```json
{
    "qrcode": "00020101021226580014BR.GOV.BCB.PIX...",
    "expirationDate": "2024-01-01T00:30:00.000Z",
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "APPROVED"
}
```

### GET /health
Verifica a saúde da API

## � Server-Sent Events (SSE)

### Conexões SSE por Gateway

Receba notificações em tempo real sobre mudanças de status de pagamentos:

- **PayEvo**: `GET /pix/sse/payevo/:id`
- **BlackCat**: `GET /pix/sse/blackcat/:id`

### Exemplo de uso SSE

```javascript
const eventSource = new EventSource('/pix/sse/payevo/payment-id-123');

eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Status atualizado:', data);
};
```

### Estatísticas SSE

- **Estatísticas**: `GET /pix/sse/stats` - Mostra conexões ativas

## 🔔 Webhooks

### URLs de Webhook por Gateway

Os gateways enviam notificações para estas URLs:

- **PayEvo**: `POST /pix/webhook/payevo`
- **BlackCat**: `POST /pix/webhook/blackcat`

### Fluxo de Notificações

1. Gateway → Webhook → Aplicação
2. Aplicação processa → Notifica SSE
3. Clientes conectados → Recebem atualização

## 🧪 Página de Testes

Acesse `/public/sse-test.html` para testar as funcionalidades SSE em tempo real.

## �🔧 Configuração

Configure as variáveis de ambiente no arquivo `.env`:

```env
NODE_ENV=development
PORT=5000

MERCADOPAGO_ENABLED=true
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui

PAGARME_ENABLED=true
PAGARME_API_KEY=sua_chave_aqui

ASAAS_ENABLED=true
ASAAS_ACCESS_TOKEN=seu_token_aqui
```

## 📊 Status dos Pagamentos

- `PENDING`: Pagamento criado, aguardando confirmação
- `APPROVED`: Pagamento aprovado/confirmado
- `EXPIRED`: Pagamento expirado

## 🧪 Testes

```bash
npm test
```

## 📁 Estrutura do Projeto

```
src/
├── server.js                 # Servidor principal
├── routes/
│   └── pix.js                # Rotas do PIX
├── middleware/
│   ├── validation.js         # Validação de dados
│   └── errorHandler.js       # Tratamento de erros
├── services/
│   ├── PaymentGatewayService.js  # Serviço principal
│   └── gateways/
│       ├── BaseGateway.js    # Classe base dos gateways
│       ├── MercadoPagoGateway.js
│       ├── PagarmeGateway.js
│       └── AsaasGateway.js
```

## 🔌 Adicionando Novos Gateways

1. Crie uma nova classe estendendo `BaseGateway`
2. Implemente os métodos `createPixPayment` e `getPaymentStatus`
3. Adicione o gateway ao array em `PaymentGatewayService.js`

Exemplo:
```javascript
const BaseGateway = require('./BaseGateway');

class NovoGateway extends BaseGateway {
  constructor(config = {}) {
    super('NovoGateway', config);
  }

  async createPixPayment(paymentData) {
    // Implementar lógica do gateway
  }

  async getPaymentStatus(paymentId) {
    // Implementar consulta de status
  }
}
```

## 🐛 Logs e Debug

A API gera logs detalhados das operações:
- 📥 Requisições recebidas
- 🔄 Tentativas de gateway
- ✅ Sucessos
- ❌ Erros

## 📝 Licença

MIT