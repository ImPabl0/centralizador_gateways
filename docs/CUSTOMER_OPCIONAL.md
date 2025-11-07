# 📝 Exemplos de Uso da API - Customer Opcional

A API agora suporta customer opcional. Quando não fornecido, um customer padrão será usado automaticamente.

## 🎯 Customer Padrão

```json
{
  "name": "Cliente Padrão",
  "email": "cliente@exemplo.com",
  "phone": "11999999999",
  "document": {
    "number": "12345678901",
    "type": "cpf"
  }
}
```

## 📋 Exemplos de Requisições

### 1. PIX com Customer Completo (Tradicional)

```bash
curl -X POST http://localhost:5000/pix \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "BRL",
    "amount": 100.50,
    "items": [
      {
        "title": "Produto Teste",
        "unitPrice": 100.50,
        "quantity": 1,
        "tangible": false
      }
    ],
    "customer": {
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11987654321",
      "document": {
        "number": "12345678901",
        "type": "cpf"
      }
    }
  }'
```

### 2. PIX sem Customer (Usa Padrão) ✨ NOVO

```bash
curl -X POST http://localhost:5000/pix \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "BRL",
    "amount": 50.00,
    "items": [
      {
        "title": "Produto Simples",
        "unitPrice": 50.00,
        "quantity": 1,
        "tangible": false
      }
    ]
  }'
```

### 3. PayEvo com Customer Opcional

```bash
curl -X POST http://localhost:5000/pix/payevo \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.00,
    "currency": "BRL",
    "paymentMethod": "pix",
    "pix": {
      "expiresInDays": 1
    },
    "items": [
      {
        "title": "Item PayEvo",
        "unitPrice": 25.00,
        "quantity": 1,
        "tangible": false
      }
    ]
  }'
```

### 4. BlackCat com Customer Opcional

```bash
curl -X POST http://localhost:5000/pix/blackcat \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 75.00,
    "currency": "BRL",
    "paymentMethod": "pix",
    "pix": {
      "expiresInDays": 1
    },
    "items": [
      {
        "title": "Item BlackCat",
        "unitPrice": 75.00,
        "quantity": 1,
        "tangible": true
      }
    ]
  }'
```

## 🧪 Teste com JavaScript

```javascript
// Exemplo de uso com fetch - sem customer
const response = await fetch('http://localhost:5000/pix', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    currency: 'BRL',
    amount: 10.00,
    items: [
      {
        title: 'Teste API',
        unitPrice: 10.00,
        quantity: 1,
        tangible: false
      }
    ]
    // customer omitido - usará padrão
  })
});

const result = await response.json();
console.log('PIX criado:', result);

// Conectar ao SSE para acompanhar status
const eventSource = new EventSource(`/pix/sse/payevo/${result.id}`);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Status atualizado:', data);
};
```

## 🔄 Validação e Comportamento

### ✅ Campos Válidos

- **customer**: Opcional - Se omitido, usa dados padrão
- **currency**: Obrigatório - Deve ser "BRL"
- **amount**: Obrigatório - Valor mínimo 0.01
- **items**: Obrigatório - Array com pelo menos 1 item

### 🎛️ Customer Padrão Usado Quando:

1. Campo `customer` não fornecido
2. Campo `customer` é `null` ou `undefined`
3. Em todas as rotas específicas dos gateways

### 🔒 Vantagens

- **Simplicidade**: Menos campos obrigatórios para testes
- **Flexibilidade**: Pode usar customer específico quando necessário
- **Compatibilidade**: Funciona com APIs existentes
- **Desenvolvimento**: Facilita testes e desenvolvimento

## 📊 Respostas

Todas as respostas mantêm o mesmo formato, independentemente se o customer foi fornecido ou usado o padrão:

```json
{
  "qrcode": "00020126580014BR.GOV.BCB.PIX...",
  "expirationDate": "2024-01-01T01:00:00.000Z",
  "id": "pix_123456789",
  "status": "PENDING"
}
```

## 🔧 Configuração de Customer Padrão

Para alterar o customer padrão, modifique a função `getDefaultCustomer()` em `src/types/index.ts`:

```typescript
export function getDefaultCustomer(): Customer {
  return {
    name: "Seu Nome Padrão",
    email: "seu-email@exemplo.com", 
    phone: "11999999999",
    document: {
      number: "12345678901",
      type: "cpf"
    }
  };
}
```

## 🎉 Benefícios da Implementação

1. **Facilita desenvolvimento**: Menos dados para preencher em testes
2. **Mantém compatibilidade**: APIs existentes continuam funcionando
3. **Flexibilidade**: Permite usar customer específico quando necessário
4. **Padronização**: Customer padrão consistente em todos os gateways
5. **SSE e Webhooks**: Funcionam normalmente independente do customer usado