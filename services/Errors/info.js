const { ERROR_PRODUCT_NOT_FOUND, ERROR_INVALID_PRODUCT, ERROR_ADD_TO_CART } = require('./Enums');

module.exports = {
  [ERROR_PRODUCT_NOT_FOUND]: {
    message: 'Producto no encontrado',
    description: 'El producto solicitado no existe en la base de datos.',
  },
  [ERROR_INVALID_PRODUCT]: {
    message: 'Producto inválido',
    description: 'El producto proporcionado no cumple con los requisitos necesarios.',
  },
  [ERROR_ADD_TO_CART]: {
    message: 'Error al agregar al carrito',
    description: 'Hubo un problema al intentar agregar el producto al carrito.',
  },

};
