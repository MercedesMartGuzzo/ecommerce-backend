import express from 'express';
import mongoose from 'mongoose';
import Carts from '../models/Cart.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('ID de carrito inválido');
    }

    try {
        const cart = await Carts.findById(id).populate('products.productId');
        
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        const detailedProducts = cart.products.map(item => ({
            title: item.productId?.title || 'Producto no encontrado',
            price: item.productId?.price || 0,
            quantity: item.quantity
        }));

        if (detailedProducts.length === 0) {
            return res.send('No hay productos en el carrito');
        }

        const totalPrice = detailedProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        res.render('carts', {
            cartId: cart._id,
            products: detailedProducts,
            totalPrice
        });

    } catch (err) {
        console.error('Error al cargar el carrito:', err);
        res.status(500).send('Error interno del servidor');
    }
});

export default router;
