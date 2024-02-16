const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  precio: Number,
  cantidad: Number,
  owner: {
    type: String,
    default: 'admin' // Establecer por defecto como 'admin'
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
