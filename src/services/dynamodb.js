const AWS = require('aws-sdk');

const getClient = () => new AWS.DynamoDB.DocumentClient();

const putOrder = async (order) => {
  const params = {
    TableName: process.env.ORDERS_TABLE,
    Item: order,
  };
  return getClient().put(params).promise();
};

const getOrder = async (orderId) => {
  const params = {
    TableName: process.env.ORDERS_TABLE,
    Key: { orderId },
  };
  const result = await getClient().get(params).promise();
  return result.Item;
};

const updateOrderStatus = async (orderId, status) => {
  const params = {
    TableName: process.env.ORDERS_TABLE,
    Key: { orderId },
    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };
  return getClient().update(params).promise();
};

module.exports = { putOrder, getOrder, updateOrderStatus };
