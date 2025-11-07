# 📚 Guia de Implementação de Novo Gateway

Este documento fornece um guia completo para implementar um novo gateway de pagamento no sistema centralizador.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura Base](#estrutura-base)
3. [Implementação Passo a Passo](#implementação-passo-a-passo)
4. [Configuração de Ambiente](#configuração-de-ambiente)
5. [Testes](#testes)
6. [Webhook e SSE](#webhook-e-sse)
7. [Exemplo Prático](#exemplo-prático)
8. [Checklist Final](#checklist-final)

## 🎯 Visão Geral

O sistema de centralização de gateways foi projetado para ser extensível, permitindo a adição de novos provedores de pagamento de forma padronizada. Cada gateway implementa uma interface comum que garante consistência e facilita a manutenção.

### Arquitetura do Sistema

```
src/
├── services/
│   ├── gateways/
│   │   ├── BaseGateway.ts          # Classe base abstrata
│   │   ├── PayEvoGateway.ts        # Exemplo de implementação
│   │   ├── BlackCatGateway.ts      # Exemplo de implementação
│   │   └── SeuNovoGateway.ts       # Sua implementação
│   ├── PaymentGatewayService.ts    # Orquestrador principal
│   └── SSEService.ts               # Gerenciador de conexões SSE
├── routes/
│   └── pix.ts                      # Rotas HTTP e webhooks
├── types/
│   └── index.ts                    # Definições de tipos
└── middleware/
    └── validation.ts               # Validações de entrada
```

## 🏗️ Estrutura Base

### 1. Classe BaseGateway

Todos os gateways devem estender a classe `BaseGateway` que define a interface comum:

```typescript
abstract class BaseGateway {
  protected name: string;
  protected config: GatewayConfig;

  constructor(name: string, config: GatewayConfig);
  
  // Métodos que devem ser implementados
  abstract healthCheck(): boolean;
  abstract createPixPayment(paymentData: GatewayPaymentData): Promise<GatewayPaymentResult>;
  abstract getPaymentStatus(paymentId: string): Promise<GatewayPaymentStatus>;
}
```

### 2. Tipos Necessários

Defina os tipos específicos do seu gateway em `src/types/index.ts`:

```typescript
// Estrutura de requisição para o gateway
export interface SeuGatewayPaymentRequest {
  // Campos específicos do seu gateway
}

// Estrutura de resposta do gateway
export interface SeuGatewayTransactionResponse {
  // Campos retornados pelo seu gateway
}
```

## 🔧 Implementação Passo a Passo

### Passo 1: Criar a Classe do Gateway

Crie o arquivo `src/services/gateways/SeuNovoGateway.ts`:

```typescript
import BaseGateway from "./BaseGateway";
import {
  GatewayConfig,
  GatewayPaymentData,
  GatewayPaymentResult,
  GatewayPaymentStatus,
  SeuGatewayPaymentRequest,
  SeuGatewayTransactionResponse,
} from "../../types";
import { configDotenv } from "dotenv";

class SeuNovoGateway extends BaseGateway {
  private apiKey: string | undefined;
  private secretKey: string | undefined;

  constructor(config: GatewayConfig = {}) {
    super("SeuNomeGateway", {
      apiUrl: "https://api.seugateway.com/",
      enabled: true,
      ...config,
    });
    configDotenv();
    this.apiKey = process.env.SEU_GATEWAY_API_KEY;
    this.secretKey = process.env.SEU_GATEWAY_SECRET_KEY;
  }

  override healthCheck(): boolean {
    // Implementar verificação de saúde
    return !!this.apiKey && !!this.secretKey && !!this.config.apiUrl;
  }

  private convertToSeuGatewayFormat(
    paymentData: GatewayPaymentData
  ): SeuGatewayPaymentRequest {
    const currentDomain = process.env.CURRENT_DOMAIN || "http://localhost:5000";
    
    return {
      // Converter dados do formato interno para o formato do seu gateway
      postbackUrl: `${currentDomain}/pix/webhook/seugateway`,
      // ... outros campos
    };
  }

  private mapSeuGatewayStatusToStandard(status: string): string {
    const statusMap: { [key: string]: string } = {
      // Mapear status do gateway para padrão interno
      'pending': 'PENDING',
      'completed': 'APPROVED',
      'failed': 'EXPIRED',
      // ... outros status
    };
    return statusMap[status] || 'PENDING';
  }

  async createPixPayment(
    paymentData: GatewayPaymentData
  ): Promise<GatewayPaymentResult> {
    console.log(`🔄 ${this.name}: Criando pagamento PIX...`);

    if (!this.apiKey || !this.secretKey) {
      throw new Error(`${this.name}: Credenciais não configuradas`);
    }

    try {
      const gatewayRequest = this.convertToSeuGatewayFormat(paymentData);

      console.log(`📤 ${this.name}: Enviando requisição para API...`);

      const response = await fetch(`${this.config.apiUrl}v1/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          // Adicionar outros headers necessários
        },
        body: JSON.stringify(gatewayRequest),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`${this.name}: HTTP ${response.status} - ${errorData}`);
      }

      const gatewayResponse = await response.json() as SeuGatewayTransactionResponse;

      console.log(`✅ ${this.name}: PIX criado com sucesso - ID: ${gatewayResponse.id}`);

      return {
        qrcode: gatewayResponse.qr_code || gatewayResponse.pix_code,
        gatewayPaymentId: gatewayResponse.id,
        expirationDate: new Date(gatewayResponse.expires_at),
        gateway: this.name,
      };
    } catch (error) {
      console.error(`❌ ${this.name}: Erro ao criar PIX:`, (error as Error).message);
      throw error;
    }
  }

  async getPaymentStatus(
    paymentId: string
  ): Promise<GatewayPaymentStatus> {
    console.log(`🔍 ${this.name}: Consultando status do pagamento ${paymentId}`);

    if (!this.apiKey) {
      throw new Error(`${this.name}: API Key não configurada`);
    }

    try {
      console.log(`📤 ${this.name}: Consultando API para status...`);

      const response = await fetch(`${this.config.apiUrl}v1/payments/${paymentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`${this.name}: HTTP ${response.status}`);
      }

      const gatewayResponse = await response.json() as SeuGatewayTransactionResponse;

      const standardStatus = this.mapSeuGatewayStatusToStandard(gatewayResponse.status);

      console.log(`✅ ${this.name}: Status obtido - ${standardStatus}`);

      return {
        status: standardStatus,
        gateway: this.name,
        gatewayPaymentId: gatewayResponse.id,
      };
    } catch (error) {
      console.error(`❌ ${this.name}: Erro ao consultar status:`, (error as Error).message);
      throw error;
    }
  }
}

export default SeuNovoGateway;
```

### Passo 2: Definir Tipos Específicos

No arquivo `src/types/index.ts`, adicione os tipos do seu gateway:

```typescript
// Adicionar no final do arquivo
export interface SeuGatewayPaymentRequest {
  postbackUrl: string;
  amount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    document: {
      number: string;
      type: string;
    };
  };
  items: Array<{
    title: string;
    unitPrice: number;
    quantity: number;
  }>;
  // Adicionar outros campos específicos
}

export interface SeuGatewayTransactionResponse {
  id: string;
  status: string;
  qr_code: string;
  expires_at: string;
  // Adicionar outros campos retornados pela API
}
```

### Passo 3: Criar Validação (opcional)

No arquivo `src/middleware/validation.ts`, adicione a validação:

```typescript
import { body } from "express-validator";

export const validateSeuGatewayPayment = [
  body("customer.name")
    .notEmpty()
    .withMessage("Nome do cliente é obrigatório"),
  body("customer.email")
    .isEmail()
    .withMessage("Email válido é obrigatório"),
  body("customer.document.number")
    .notEmpty()
    .withMessage("Documento é obrigatório"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Valor deve ser maior que 0"),
  // Adicionar outras validações necessárias
];
```

### Passo 4: Adicionar nas Rotas

No arquivo `src/routes/pix.ts`, importe e adicione as rotas:

```typescript
// Adicionar imports
import SeuNovoGateway from "../services/gateways/SeuNovoGateway";
import { validateSeuGatewayPayment } from "../middleware/validation";

// Adicionar instância
const seuNovoGateway = new SeuNovoGateway();

// Adicionar rota de criação
router.post(
  "/seugateway",
  validateSeuGatewayPayment,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionData = req.body as TransactionRequest;

      console.log("📥 Nova transação SeuGateway específica recebida:", {
        customer: transactionData.customer.name,
        amount: transactionData.amount,
      });

      // Converter para formato interno
      const paymentData = {
        currency: "BRL" as const,
        amount: transactionData.amount,
        items: transactionData.items,
        customer: transactionData.customer,
        id: `sg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      };

      const result = await seuNovoGateway.createPixPayment(paymentData);

      res.status(201).json({
        qrcode: result.qrcode,
        expirationDate: result.expirationDate.toISOString(),
        id: result.gatewayPaymentId,
        status: "PENDING",
      });
    } catch (error) {
      console.error("❌ Erro ao criar PIX SeuGateway:", (error as Error).message);
      next(error);
    }
  }
);

// Adicionar rota de consulta
router.get(
  "/seugateway/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "ID inválido",
          message: "O ID do pagamento é obrigatório",
        });
        return;
      }

      const result = await seuNovoGateway.getPaymentStatus(id);
      res.json(result);
    } catch (error) {
      console.error("❌ Erro ao consultar PIX SeuGateway:", (error as Error).message);
      next(error);
    }
  }
);

// Adicionar rota SSE
router.get(
  "/sse/seugateway/:id",
  (req: Request, res: Response): void => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: "ID inválido",
        message: "O ID do pagamento é obrigatório",
      });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    const connectionId = sseService.addConnection(id, "seugateway", res);

    res.write(`data: ${JSON.stringify({
      type: 'connection_established',
      paymentId: id,
      gateway: 'seugateway',
      connectionId,
      timestamp: new Date().toISOString(),
    })}\n\n`);

    req.on("close", () => {
      sseService.removeConnection(connectionId);
    });
  }
);

// Adicionar webhook
router.post(
  "/webhook/seugateway",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = JSON.parse(req.body.toString());
      console.log("🔔 Webhook SeuGateway recebido:", payload);

      const paymentId = payload.payment_id || payload.id;
      const status = payload.status;
      
      if (!paymentId) {
        res.status(400).json({ error: "Payment ID missing" });
        return;
      }

      // Notificar via SSE
      sseService.notifyPayment(paymentId, "seugateway", {
        status,
        ...payload,
      });

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("❌ Erro ao processar webhook SeuGateway:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
```

### Passo 5: Integrar no Orquestrador

No arquivo `src/services/PaymentGatewayService.ts`, adicione o novo gateway:

```typescript
// Adicionar import
import SeuNovoGateway from "./gateways/SeuNovoGateway";

class PaymentGatewayService {
  private gateways: BaseGateway[];

  constructor() {
    this.gateways = [
      new PayEvoGateway(),
      new BlackCatGateway(),
      new SeuNovoGateway(), // Adicionar aqui
    ];
  }

  // Resto da implementação permanece igual
}
```

## ⚙️ Configuração de Ambiente

### 1. Variáveis de Ambiente

Adicione as variáveis no `.env` e `.env.example`:

```bash
# SeuGateway Configuration
SEU_GATEWAY_ENABLED=true
SEU_GATEWAY_API_KEY=sua_api_key_aqui
SEU_GATEWAY_SECRET_KEY=sua_secret_key_aqui
```

### 2. Configuração do Domínio

Certifique-se de que `CURRENT_DOMAIN` está configurado para webhooks funcionarem:

```bash
CURRENT_DOMAIN=https://seu-dominio.com
# ou para desenvolvimento
CURRENT_DOMAIN=http://localhost:5000
```

## 📡 Webhook e SSE

### Configuração de Webhook

1. **URL do Webhook**: `https://seu-dominio.com/pix/webhook/seugateway`
2. **Método**: POST
3. **Content-Type**: application/json
4. **Eventos**: Mudanças de status de pagamento

### Configuração de SSE

1. **URL SSE**: `https://seu-dominio.com/pix/sse/seugateway/:id`
2. **Método**: GET
3. **Headers**: `text/event-stream`

### Fluxo de Notificação

```
1. Gateway envia webhook → Sua aplicação
2. Aplicação processa webhook → Extrai payment_id e status
3. Aplicação notifica SSE → sseService.notifyPayment()
4. Clientes conectados → Recebem atualização em tempo real
```

## 🎯 Exemplo Prático: Gateway Fictício "SuperPay"

Vamos implementar um gateway fictício chamado "SuperPay":

### 1. Estrutura da API SuperPay

```
POST /api/v1/pix/create
{
  "webhook_url": "https://callback.com/webhook",
  "amount_cents": 1000,
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "tax_id": "12345678901"
  }
}

Response:
{
  "transaction_id": "sp_123456",
  "pix_code": "00020126...",
  "expires_at": "2024-01-01T23:59:59Z",
  "status": "waiting_payment"
}
```

### 2. Implementação

```typescript
// src/services/gateways/SuperPayGateway.ts
import BaseGateway from "./BaseGateway";
import {
  GatewayConfig,
  GatewayPaymentData,
  GatewayPaymentResult,
  GatewayPaymentStatus,
} from "../../types";
import { configDotenv } from "dotenv";

interface SuperPayRequest {
  webhook_url: string;
  amount_cents: number;
  customer: {
    name: string;
    email: string;
    tax_id: string;
  };
}

interface SuperPayResponse {
  transaction_id: string;
  pix_code: string;
  expires_at: string;
  status: string;
}

class SuperPayGateway extends BaseGateway {
  private apiKey: string | undefined;

  constructor(config: GatewayConfig = {}) {
    super("SuperPay", {
      apiUrl: "https://api.superpay.com/",
      enabled: true,
      ...config,
    });
    configDotenv();
    this.apiKey = process.env.SUPERPAY_API_KEY;
  }

  override healthCheck(): boolean {
    return !!this.apiKey && !!this.config.apiUrl;
  }

  private convertToSuperPayFormat(paymentData: GatewayPaymentData): SuperPayRequest {
    const currentDomain = process.env.CURRENT_DOMAIN || "http://localhost:5000";
    
    return {
      webhook_url: `${currentDomain}/pix/webhook/superpay`,
      amount_cents: Math.round(paymentData.amount * 100), // Converter para centavos
      customer: {
        name: paymentData.customer.name,
        email: paymentData.customer.email,
        tax_id: paymentData.customer.document.number,
      },
    };
  }

  private mapSuperPayStatusToStandard(status: string): string {
    const statusMap: { [key: string]: string } = {
      'waiting_payment': 'PENDING',
      'paid': 'APPROVED',
      'expired': 'EXPIRED',
      'cancelled': 'EXPIRED',
    };
    return statusMap[status] || 'PENDING';
  }

  async createPixPayment(paymentData: GatewayPaymentData): Promise<GatewayPaymentResult> {
    console.log(`🔄 ${this.name}: Criando pagamento PIX...`);

    if (!this.apiKey) {
      throw new Error(`${this.name}: API Key não configurada`);
    }

    try {
      const superPayRequest = this.convertToSuperPayFormat(paymentData);

      const response = await fetch(`${this.config.apiUrl}api/v1/pix/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(superPayRequest),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`${this.name}: HTTP ${response.status} - ${errorData}`);
      }

      const superPayResponse = await response.json() as SuperPayResponse;

      return {
        qrcode: superPayResponse.pix_code,
        gatewayPaymentId: superPayResponse.transaction_id,
        expirationDate: new Date(superPayResponse.expires_at),
        gateway: this.name,
      };
    } catch (error) {
      console.error(`❌ ${this.name}: Erro ao criar PIX:`, (error as Error).message);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<GatewayPaymentStatus> {
    console.log(`🔍 ${this.name}: Consultando status do pagamento ${paymentId}`);

    if (!this.apiKey) {
      throw new Error(`${this.name}: API Key não configurada`);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}api/v1/pix/${paymentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`${this.name}: HTTP ${response.status}`);
      }

      const superPayResponse = await response.json() as SuperPayResponse;
      const standardStatus = this.mapSuperPayStatusToStandard(superPayResponse.status);

      return {
        status: standardStatus,
        gateway: this.name,
        gatewayPaymentId: superPayResponse.transaction_id,
      };
    } catch (error) {
      console.error(`❌ ${this.name}: Erro ao consultar status:`, (error as Error).message);
      throw error;
    }
  }
}

export default SuperPayGateway;
```

## ✅ Checklist Final

Antes de considerar a implementação completa, verifique:

### Código

- [ ] Classe do gateway implementada e testada
- [ ] Tipos definidos em `src/types/index.ts`
- [ ] Validações adicionadas em `src/middleware/validation.ts`
- [ ] Rotas adicionadas em `src/routes/pix.ts`
- [ ] Gateway integrado em `PaymentGatewayService.ts`
- [ ] Testes unitários escritos e passando

### Configuração

- [ ] Variáveis de ambiente definidas
- [ ] Webhook URL configurada no gateway
- [ ] Domínio atual configurado
- [ ] Logs adequados implementados

### Funcionalidades

- [ ] Criação de pagamento PIX funciona
- [ ] Consulta de status funciona
- [ ] Webhook recebe notificações
- [ ] SSE notifica clientes em tempo real
- [ ] Health check implementado

### Documentação e Testes

- [ ] Documentação da API do gateway
- [ ] Testes de integração
- [ ] Teste de webhook com ngrok
- [ ] Teste de SSE no frontend

### Monitoramento

- [ ] Logs estruturados
- [ ] Tratamento de erros adequado
- [ ] Timeout e retry implementados
- [ ] Métricas de saúde

## 🚀 Deploy

### Variáveis de Produção

```bash
# Gateway Credentials
SEU_GATEWAY_API_KEY=prod_key_here
SEU_GATEWAY_SECRET_KEY=prod_secret_here

# Domain
CURRENT_DOMAIN=https://api.suaempresa.com

# Security
NODE_ENV=production
```

### Considerações de Segurança

1. **Validação de Webhook**: Implemente verificação de assinatura
2. **Rate Limiting**: Configure limites por IP
3. **HTTPS**: Use sempre HTTPS em produção
4. **Logs**: Não logue informações sensíveis

## 📞 Suporte

Se tiver dúvidas durante a implementação:

1. Consulte a documentação da API do gateway
2. Verifique os logs de erro detalhados
3. Use o arquivo de teste SSE para debug
4. Verifique se as variáveis de ambiente estão corretas
5. Entre em contato com [Pablo](https://wa.me/+5575988740158)
