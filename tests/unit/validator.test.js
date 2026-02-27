const { validateOrderPayload } = require('../../src/utils/validator');

describe('Validator', () => {
  test('deve retornar vazio para payload válido', () => {
    const errors = validateOrderPayload({
      customerId: 'c-1',
      items: [{ productId: 'p-1', name: 'Produto', quantity: 1, price: 10 }],
    });
    expect(errors).toHaveLength(0);
  });

  test('deve retornar erro para payload null', () => {
    const errors = validateOrderPayload(null);
    expect(errors).toContain('O corpo da requisição é obrigatório');
  });

  test('deve retornar erro para customerId ausente', () => {
    const errors = validateOrderPayload({
      items: [{ productId: 'p-1', name: 'A', quantity: 1, price: 10 }],
    });
    expect(errors).toContain('customerId é obrigatório e deve ser uma string');
  });

  test('deve retornar erro para customerId não string', () => {
    const errors = validateOrderPayload({
      customerId: 123,
      items: [{ productId: 'p-1', name: 'A', quantity: 1, price: 10 }],
    });
    expect(errors).toContain('customerId é obrigatório e deve ser uma string');
  });

  test('deve retornar erro para items ausente', () => {
    const errors = validateOrderPayload({ customerId: 'c-1' });
    expect(errors).toContain('items é obrigatório e deve ser um array com pelo menos 1 item');
  });

  test('deve retornar erro para items vazio', () => {
    const errors = validateOrderPayload({ customerId: 'c-1', items: [] });
    expect(errors).toContain('items é obrigatório e deve ser um array com pelo menos 1 item');
  });

  test('deve validar campos obrigatórios de cada item', () => {
    const errors = validateOrderPayload({
      customerId: 'c-1',
      items: [{}],
    });
    expect(errors).toContain('items[0].productId é obrigatório e deve ser uma string');
    expect(errors).toContain('items[0].name é obrigatório e deve ser uma string');
    expect(errors).toContain('items[0].quantity é obrigatório e deve ser um número >= 1');
    expect(errors).toContain('items[0].price é obrigatório e deve ser um número >= 0');
  });

  test('deve validar múltiplos itens independentemente', () => {
    const errors = validateOrderPayload({
      customerId: 'c-1',
      items: [
        { productId: 'p-1', name: 'A', quantity: 1, price: 10 },
        { name: 'B', quantity: 0, price: -1 },
      ],
    });
    expect(errors).toContain('items[1].productId é obrigatório e deve ser uma string');
    expect(errors).toContain('items[1].quantity é obrigatório e deve ser um número >= 1');
    expect(errors).toContain('items[1].price é obrigatório e deve ser um número >= 0');
  });
});
