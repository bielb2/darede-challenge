const validateOrderPayload = (body) => {
  const errors = [];

  if (!body) {
    errors.push('O corpo da requisição é obrigatório');
    return errors;
  }

  if (!body.customerId || typeof body.customerId !== 'string') {
    errors.push('customerId é obrigatório e deve ser uma string');
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    errors.push('items é obrigatório e deve ser um array com pelo menos 1 item');
    return errors;
  }

  body.items.forEach((item, index) => {
    if (!item.productId || typeof item.productId !== 'string') {
      errors.push(`items[${index}].productId é obrigatório e deve ser uma string`);
    }
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`items[${index}].name é obrigatório e deve ser uma string`);
    }
    if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity < 1) {
      errors.push(`items[${index}].quantity é obrigatório e deve ser um número >= 1`);
    }
    if (item.price === undefined || typeof item.price !== 'number' || item.price < 0) {
      errors.push(`items[${index}].price é obrigatório e deve ser um número >= 0`);
    }
  });

  return errors;
};

module.exports = { validateOrderPayload };
