import express from 'express';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

const router = express.Router();

router.post('/products/:id/add-to-cart', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).send('Cantidad inválida');
        }
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        
        let cart = await Cart.findById('1'); 
        if (!cart) {
            cart = new Cart({ products: [] });
        }
        const productInCart = cart.products.find(p => p.productId.toString() === id);
        if (productInCart) {
            productInCart.quantity += parseInt(quantity, 10);
        } else {
            cart.products.push({ productId: id, quantity: parseInt(quantity, 10) });
        }
        await cart.save();
        res.redirect('/carts');
    } catch (err) {
        console.error('Error al agregar el producto:', err);
        res.status(500).send('Error interno del servidor');
    }
});


router.get('/carts', async (req, res) => {
    try {
        const cart = await Cart.findById('1'); 
        res.render('carts', { cart }); 
    } catch (err) {
        res.status(500).send('Error al cargar el carrito');
    }
});

export default router;
