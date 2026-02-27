const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

process.env.ORDERS_TABLE = 'test-orders';

const { handler } = require('../../src/handlers/processPayment');

describe('ProcessPayment Handler', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  test('deve processar pagamento e atualizar status para PROCESSED', async () => {
    const updatedOrder = { orderId: 'order-123', status: 'PROCESSED' };

    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
      expect(params.Key.orderId).toBe('order-123');
      expect(params.ExpressionAttributeValues[':status']).toBe('PROCESSED');
      callback(null, { Attributes: updatedOrder });
    });

    const event = {
      Records: [
        { body: JSON.stringify({ orderId: 'order-123' }) },
      ],
    };

    await handler(event);
  }, 10000);

  test('deve processar múltiplas mensagens em batch', async () => {
    const processedOrders = [];

    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
      processedOrders.push(params.Key.orderId);
      callback(null, { Attributes: { orderId: params.Key.orderId, status: 'PROCESSED' } });
    });

    const event = {
      Records: [
        { body: JSON.stringify({ orderId: 'order-1' }) },
        { body: JSON.stringify({ orderId: 'order-2' }) },
      ],
    };

    await handler(event);

    expect(processedOrders).toContain('order-1');
    expect(processedOrders).toContain('order-2');
  }, 15000);

  test('deve lançar erro se DynamoDB falhar', async () => {
    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
      callback(new Error('DynamoDB error'));
    });

    const event = {
      Records: [
        { body: JSON.stringify({ orderId: 'order-fail' }) },
      ],
    };

    await expect(handler(event)).rejects.toThrow('DynamoDB error');
  }, 10000);
});
