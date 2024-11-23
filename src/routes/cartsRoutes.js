import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';

const router = express.Router();
const dataPath = path.join(process.cwd(), 'data', 'carts.json');
const productsPath = path.join(process.cwd(), 'data', 'products.json');

// Página para mostrar el carrito
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        // Leer el archivo de carritos
        const cartsData = await fs.readFile(dataPath, 'utf-8');
        const carts = JSON.parse(cartsData);

        // Encontrar el carrito por su ID
        const cart = carts.find(cart => cart.id === cid);
        if (!cart) {
            return res.status(404).render('error', { message: 'Carrito no encontrado' });
        }

        // Leer los productos para mostrar más detalles
        const productsData = await fs.readFile(productsPath, 'utf-8');
        const products = JSON.parse(productsData);

        // Mapear los productos del carrito con los detalles
        const detailedProducts = cart.products.map(item => {
            const product = products.find(prod => prod.id === item.product);
            return {
                title: product.title,
                price: product.price,
                quantity: item.quantity
            };
        });

        res.render('cart', { cartId: cart.id, products: detailedProducts });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al cargar el carrito' });
    }
});

export default router; 