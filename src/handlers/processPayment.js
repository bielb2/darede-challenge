const { updateOrderStatus } = require('../services/dynamodb');

module.exports.handler = async (event) => {
  for (const record of event.Records) {
    const { orderId } = JSON.parse(record.body);

    console.log(`Processando pagamento do pedido: ${orderId}`);

    // mock: 10s para simular o tempo de processamento do pagamento
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await updateOrderStatus(orderId, 'PROCESSED');

    console.log(`Pedido processado com sucesso: ${orderId}`);
  }
};
