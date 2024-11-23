import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';

const router = express.Router();
const productsPath = path.join(process.cwd(), 'data', 'products.json'); 

// Página para mostrar todos los productos
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(productsPath, 'utf-8');
        const products = JSON.parse(data);

        res.render('products', { products });
    } catch (err) {
        console.error('Error leyendo los productos:', err);
        res.status(500).render('error', { message: 'Error al cargar los productos' });
    }
});


router.post('/:id/add-to-cart', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;  

    try {
     
        const productsData = await fs.readFile(productsPath, 'utf-8');
        const products = JSON.parse(productsData);
        const product = products.find(prod => prod.id === id);

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        // Leer carrito
        const cartsData = await fs.readFile(path.join(process.cwd(), 'data', 'carts.json'), 'utf-8');
        const carts = JSON.parse(cartsData);

     
        let cart = carts[0];
        if (!cart) {
            cart = { id: '1', products: [] }; 
            carts.push(cart);
        }

        const productInCart = cart.products.find(item => item.product === id);

        if (productInCart) {
            productInCart.quantity += quantity; 
        } else {
            cart.products.push({ product: id, quantity }); 
        }

        await fs.writeFile(path.join(process.cwd(), 'data', 'carts.json'), JSON.stringify(carts));

        res.send('Producto agregado al carrito');
    } catch (err) {
        console.error('Error al agregar al carrito:', err);
        res.status(500).send('Error al agregar el producto al carrito');
    }
});

export default router;
