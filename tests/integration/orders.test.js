const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

process.env.ORDERS_TABLE = 'test-orders';
process.env.ORDERS_QUEUE_URL = 'http://localhost:4566/queue/test-queue';

const createOrderHandler = require('../../src/handlers/createOrder').handler;
const processPaymentHandler = require('../../src/handlers/processPayment').handler;

describe('Orders Integration', () => {
  let savedOrders;
  let sentMessages;

  beforeEach(() => {
    savedOrders = {};
    sentMessages = [];

    AWSMock.setSDKInstance(AWS);

    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      savedOrders[params.Item.orderId] = params.Item;
      callback(null, {});
    });

    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
      const orderId = params.Key.orderId;
      if (savedOrders[orderId]) {
        savedOrders[orderId].status = params.ExpressionAttributeValues[':status'];
        savedOrders[orderId].updatedAt = params.ExpressionAttributeValues[':updatedAt'];
      }
      callback(null, { Attributes: savedOrders[orderId] });
    });

    AWSMock.mock('SQS', 'sendMessage', (params, callback) => {
      sentMessages.push(JSON.parse(params.MessageBody));
      callback(null, { MessageId: 'msg-123' });
    });
  });

  afterEach(() => {
    AWSMock.restore();
  });

  test('fluxo completo: criar pedido -> processar pagamento', async () => {
    const createEvent = {
      body: JSON.stringify({
        customerId: 'customer-integration',
        items: [
          { productId: 'prod-001', name: 'Produto Integração', quantity: 3, price: 33.33 },
        ],
      }),
    };

    const createResult = await createOrderHandler(createEvent);
    const createdOrder = JSON.parse(createResult.body);

    expect(createResult.statusCode).toBe(201);
    expect(createdOrder.status).toBe('PENDING');
    expect(createdOrder.total).toBe(99.99);
    expect(sentMessages).toHaveLength(1);
    expect(sentMessages[0].orderId).toBe(createdOrder.orderId);

    const sqsEvent = {
      Records: [
        { body: JSON.stringify({ orderId: createdOrder.orderId }) },
      ],
    };

    await processPaymentHandler(sqsEvent);

    const finalOrder = savedOrders[createdOrder.orderId];
    expect(finalOrder.status).toBe('PROCESSED');
    expect(finalOrder.updatedAt).toBeDefined();
  }, 15000);

  test('deve rejeitar pedido inválido sem afetar o banco', async () => {
    const createEvent = {
      body: JSON.stringify({ customerId: '', items: [] }),
    };

    const result = await createOrderHandler(createEvent);

    expect(result.statusCode).toBe(400);
    expect(Object.keys(savedOrders)).toHaveLength(0);
    expect(sentMessages).toHaveLength(0);
  });
});
