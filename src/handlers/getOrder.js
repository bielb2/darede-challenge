const { getOrder } = require('../services/dynamodb');

module.exports.handler = async (event) => {
  try {
    const { orderId } = event.pathParameters;

    const order = await getOrder(orderId);

    if (!order) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Pedido não encontrado' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Erro interno do servidor' }),
    };
  }
};
