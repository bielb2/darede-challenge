const AWS = require('aws-sdk');

const getClient = () => new AWS.SQS();

const sendToQueue = async (message) => {
  const params = {
    QueueUrl: process.env.ORDERS_QUEUE_URL,
    MessageBody: JSON.stringify(message),
  };
  return getClient().sendMessage(params).promise();
};

module.exports = { sendToQueue };
