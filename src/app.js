import express from 'express';
import productsRoutes from './routes/productsRoutes.js';
import cartsRoutes from './routes/cartsRoutes.js';

const app = express();
app.use(express.json());

// Configurar rutas
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

export default app;
