const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const productosRoutes = require('./routes/productos.routes');
app.use('/api/productos', productosRoutes);
const clientesRoutes = require('./routes/clientes.routes');
app.use('/api/clientes', clientesRoutes);
const ventasRoutes = require('./routes/ventas.routes');
app.use('/api/ventas', ventasRoutes);
const comprasRoutes = require('./routes/compras.routes');
app.use('/api/compras', comprasRoutes);
const categoriasRoutes = require('./routes/categorias.routes');
app.use('/api/categorias', categoriasRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Papel y Luna funcionando 🚀' });
});

module.exports = app;