const brotli = require('brotli');
const express = require('express');
const router = express.Router();

// Función para generar productos
const generateProducts = () => {
  const products = [];
  for (let i = 1; i <= 100; i++) {
    products.push({
      _id: i,
      name: `Product ${i}`,
    });
  }
  return products;
};

// Ruta '/mockingproducts'
router.get('/mockingproducts', (req, res) => {
  const products = generateProducts();
  const compressedData = brotli.compress(JSON.stringify(products));
  res.set('Content-Type', 'application/json');
  res.set('Content-Encoding', 'br'); 
  res.send(compressedData);
});

module.exports = router;
