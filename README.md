# Serverless Order Processor

Microsserviço para registro e processamento de pedidos de compra, construído com Serverless Framework, AWS Lambda, API Gateway, DynamoDB e SQS.

---

## Arquitetura

```
Cliente
  │
  ▼
API Gateway  (POST /orders)
  │
  ▼
Lambda: CreateOrder
  ├── Valida o payload recebido
  ├── Gera um orderId único (UUID)
  ├── Salva o pedido no DynamoDB  (status: PENDING)
  └── Publica mensagem no SQS
              │
              ▼
        Lambda: ProcessPayment
          ├── Consome a mensagem do SQS
          ├── Aguarda 4 segundos (simula integração externa)
          └── Atualiza o pedido no DynamoDB  (status: PROCESSED)
```

### Recursos AWS provisionados

| Recurso | Nome | Finalidade |
|---|---|---|
| API Gateway | `orders-api` | Expõe o endpoint HTTP |
| Lambda | `CreateOrder` | Valida e registra o pedido |
| Lambda | `ProcessPayment` | Processa o pagamento de forma assíncrona |
| DynamoDB | `OrdersTable` | Armazena os pedidos |
| SQS | `OrdersQueue` | Fila para desacoplamento assíncrono |
| CloudWatch | Logs automáticos | Trace completo de cada pedido |

### Decisões arquiteturais

- **SQS** foi escolhido como mensageria por ser mais simples de configurar e monitorar do que DynamoDB Streams para este caso de uso. Também oferece retry automático em caso de falha no processamento.
- **UUID v4** para geração de `orderId`, garantindo unicidade sem necessidade de sequência no banco.
- **CloudWatch Logs** habilitado em todas as Lambdas com nível `INFO`, permitindo rastrear o ciclo de vida completo de cada pedido.
- **Dead Letter Queue (DLQ)** configurada no SQS para capturar mensagens que falharem após 3 tentativas.

---

## Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- [Serverless Framework](https://www.serverless.com/)
- [AWS CLI](https://aws.amazon.com/cli/) configurado com credenciais válidas

### Instalação das ferramentas

```bash
# Serverless Framework
npm install -g serverless

# AWS CLI (Ubuntu/Debian)
sudo apt install awscli -y

# Configurar credenciais AWS
aws configure
# Informe:
#   AWS Access Key ID
#   AWS Secret Access Key
#   Default region: us-east-1
#   Output format: json
```

---

## Instalação do projeto

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd serverless-order-processor

# Instale as dependências
npm install
```

---

## Rodando localmente

O projeto usa o plugin `serverless-offline` com `serverless-dynamodb` e `serverless-sqs-local` para simular os serviços AWS localmente.
Recomendo testar via aws, no .env.template tem as informações de keys

### 1. Instale o Java (necessário para DynamoDB Local)

```bash
sudo apt install default-jdk -y
```

### 2. Instale o DynamoDB Local e SQS Local

```bash
serverless dynamodb install
```

### 3. Suba o ambiente local

```bash
npm run dev
# ou
serverless offline start
```

O servidor local estará disponível em `http://localhost:3000`.

---

## Deploy na AWS

```bash
# Deploy completo (cria toda a infraestrutura)
serverless deploy

# Deploy apenas de uma função específica (mais rápido)
serverless deploy function --function createOrder
```

Ao final do deploy, o Serverless exibirá a URL do endpoint, por exemplo:
```
endpoints:
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/orders
```

---

## Testando o endpoint

### cURL

```bash
# Criar um pedido
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "items": [
      {
        "productId": "prod-001",
        "name": "Produto Exemplo",
        "quantity": 2,
        "price": 49.90
      }
    ]
  }'
```

### Exemplo de resposta (201 Created)

```json
{
  "orderId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerId": "customer-123",
  "status": "PENDING",
  "items": [
    {
      "productId": "prod-001",
      "name": "Produto Exemplo",
      "quantity": 2,
      "price": 49.90
    }
  ],
  "total": 99.80,
  "createdAt": "2026-02-26T10:00:00.000Z"
}
```

### Localmente (serverless-offline)

```bash
curl -X POST http://localhost:3000/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "items": [
      {
        "productId": "prod-001",
        "name": "Produto Exemplo",
        "quantity": 2,
        "price": 49.90
      }
    ]
  }'
```

### Validações do payload

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `customerId` | string | Sim | ID do cliente |
| `items` | array | Sim | Lista de itens (mínimo 1) |
| `items[].productId` | string | Sim | ID do produto |
| `items[].name` | string | Sim | Nome do produto |
| `items[].quantity` | number | Sim | Quantidade (mínimo 1) |
| `items[].price` | number | Sim | Preço unitário (mínimo 0) |

### Erros possíveis

| Status | Descrição |
|---|---|
| `400` | Payload inválido (campo obrigatório ausente ou inválido) |
| `201` | Pedido criado com sucesso |

---

## Testes

```bash
# Todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Com cobertura
npm run test:coverage
```

---

## Estrutura do projeto

```
serverless-order-processor/
├── src/
│   ├── handlers/
│   │   ├── createOrder.js       # Lambda CreateOrder
│   │   └── processPayment.js    # Lambda ProcessPayment
│   ├── services/
│   │   ├── dynamodb.js          # Acesso ao DynamoDB
│   │   └── sqs.js               # Publicação no SQS
│   └── utils/
│       └── validator.js         # Validação de payload
├── tests/
│   ├── unit/
│   │   ├── createOrder.test.js
│   │   └── processPayment.test.js
│   └── integration/
│       └── orders.test.js
├── serverless.yml               # Configuração completa da infraestrutura
├── package.json
└── README.md
```

---

## Removendo os recursos da AWS

```bash
serverless remove
```

Isso deleta todos os recursos criados (Lambda, API Gateway, DynamoDB, SQS, CloudWatch).
