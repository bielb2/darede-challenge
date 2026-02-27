const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

process.env.ORDERS_TABLE = 'test-orders';
process.env.ORDERS_QUEUE_URL = 'http://localhost:4566/queue/test-queue';

const { handler } = require('../../src/handlers/createOrder');

describe('CreateOrder Handler', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(null, {});
    });
    AWSMock.mock('SQS', 'sendMessage', (params, callback) => {
      callback(null, { MessageId: 'mock-message-id' });
    });
  });

  afterEach(() => {
    AWSMock.restore();
  });

  const validPayload = {
    customerId: 'customer-123',
    items: [
      { productId: 'prod-001', name: 'Produto A', quantity: 2, price: 49.90 },
    ],
  };

  test('deve criar um pedido com sucesso', async () => {
    const event = { body: JSON.stringify(validPayload) };

    const result = await handler(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(201);
    expect(body.orderId).toBeDefined();
    expect(body.customerId).toBe('customer-123');
    expect(body.status).toBe('PENDING');
    expect(body.total).toBe(99.80);
    expect(body.items).toHaveLength(1);
    expect(body.createdAt).toBeDefined();
  });

  test('deve retornar 400 quando customerId está ausente', async () => {
    const event = { body: JSON.stringify({ items: validPayload.items }) };

    const result = await handler(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(body.errors).toContain('customerId é obrigatório e deve ser uma string');
  });

  test('deve retornar 400 quando items está vazio', async () => {
    const event = { body: JSON.stringify({ customerId: 'c-1', items: [] }) };

    const result = await handler(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(body.errors).toContain('items é obrigatório e deve ser um array com pelo menos 1 item');
  });

  test('deve retornar 400 quando items não é array', async () => {
    const event = { body: JSON.stringify({ customerId: 'c-1', items: 'invalid' }) };

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
  });

  test('deve retornar 400 quando item não tem productId', async () => {
    const event = {
      body: JSON.stringify({
        customerId: 'c-1',
        items: [{ name: 'Produto', quantity: 1, price: 10 }],
      }),
    };

    const result = await handler(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(body.errors).toContain('items[0].productId é obrigatório e deve ser uma string');
  });

  test('deve retornar 400 quando quantity é menor que 1', async () => {
    const event = {
      body: JSON.stringify({
        customerId: 'c-1',
        items: [{ productId: 'p-1', name: 'Produto', quantity: 0, price: 10 }],
      }),
    };

    const result = await handler(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(body.errors).toContain('items[0].quantity é obrigatório e deve ser um número >= 1');
  });

  test('deve retornar 400 quando price é negativo', async () => {
    const event = {
      body: JSON.stringify({
        customerId: 'c-1',
        items: [{ productId: 'p-1', name: 'Produto', quantity: 1, price: -5 }],
      }),
    };

    const result = await handler(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(body.errors).toContain('items[0].price é obrigatório e deve ser um número >= 0');
  });

  test('deve calcular o total corretamente com múltiplos itens', async () => {
    const event = {
      body: JSON.stringify({
        customerId: 'c-1',
        items: [
          { productId: 'p-1', name: 'A', quantity: 2, price: 10.50 },
          { productId: 'p-2', name: 'B', quantity: 1, price: 25.00 },
        ],
      }),
    };

    const result = await handler(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(201);
    expect(body.total).toBe(46.00);
  });

  test('deve retornar 500 quando ocorre erro inesperado', async () => {
    const event = { body: '{invalid json' };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
  });
});
