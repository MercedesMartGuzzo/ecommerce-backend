import express from 'express';
import productsRouter from './routes/productsRoutes.js';
import cartsRouter from './routes/cartsRoutes.js';

const app = express();
const port = 8080;

app.use(express.json());
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

