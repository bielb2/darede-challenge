const { v4: uuidv4 } = require('uuid');
const { putOrder } = require('../services/dynamodb');
const { sendToQueue } = require('../services/sqs');
const { validateOrderPayload } = require('../utils/validator');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const errors = validateOrderPayload(body);
    if (errors.length > 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Payload inválido', errors }),
      };
    }

    const total = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const order = {
      orderId: uuidv4(),
      customerId: body.customerId,
      items: body.items,
      total: Math.round(total * 100) / 100,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await putOrder(order);
    await sendToQueue({ orderId: order.orderId });

    console.log(`Pedido criado: ${order.orderId}`);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Erro interno do servidor' }),
    };
  }
};
