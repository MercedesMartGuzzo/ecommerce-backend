import express from 'express';
import fs from 'fs';

const router = express.Router();
const cartsFilePath = './data/carts.json';
const productsFilePath = './data/products.json';

// GET /api/carts/:cid - Listar los productos en un carrito
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    fs.readFile(cartsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading carts file' });
        const carts = JSON.parse(data);
        const cart = carts.find(c => c.id === cid);
        if (cart) res.json(cart.products);
        else res.status(404).json({ error: 'Cart not found' });
    });
});

// POST /api/carts - Crear un carrito vacío
router.post('/', (req, res) => {
    fs.readFile(cartsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading carts file' });
        const carts = JSON.parse(data);
        const newId = (carts.length > 0) ? (parseInt(carts[carts.length - 1].id) + 1).toString() : '1';
        const newCart = { id: newId, products: [] };
        carts.push(newCart);

        fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), 'utf8', (err) => {
            if (err) return res.status(500).json({ error: 'Error saving new cart' });
            res.status(201).json(newCart);
        });
    });
});

// POST /api/carts/:cid/product/:pid - Agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;

    fs.readFile(cartsFilePath, 'utf8', (err, cartData) => {
        if (err) return res.status(500).json({ error: 'Error reading carts file' });
        const carts = JSON.parse(cartData);
        let cart = carts.find(c => c.id === cid);

        if (!cart) {
            cart = { id: cid, products: [] };
            carts.push(cart);
        }

        fs.readFile(productsFilePath, 'utf8', (err, productData) => {
            if (err) return res.status(500).json({ error: 'Error reading products file' });
            const products = JSON.parse(productData);
            const product = products.find(p => p.id === pid);

            if (!product) return res.status(404).json({ error: 'Product not found' });

            const cartProduct = cart.products.find(p => p.product === pid);
            if (cartProduct) {
                cartProduct.quantity += 1;
            } else {
                cart.products.push({ product: pid, quantity: 1 });
            }

            fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), 'utf8', (err) => {
                if (err) return res.status(500).json({ error: 'Error saving cart' });
                res.status(201).json(cart);
            });
        });
    });
});

// PUT /api/carts/:cid/product/:pid - Actualizar la cantidad de un producto en el carrito
router.put('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    fs.readFile(cartsFilePath, 'utf8', (err, cartData) => {
        if (err) return res.status(500).json({ error: 'Error reading carts file' });
        const carts = JSON.parse(cartData);
        const cart = carts.find(c => c.id === cid);

        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        const cartProduct = cart.products.find(p => p.product === pid);
        if (!cartProduct) return res.status(404).json({ error: 'Product not found in cart' });

        cartProduct.quantity = quantity;

        fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), 'utf8', (err) => {
            if (err) return res.status(500).json({ error: 'Error updating cart' });
            res.status(200).json(cart);
        });
    });
});

// DELETE /api/carts/:cid/product/:pid - Eliminar un producto del carrito
router.delete('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;

    fs.readFile(cartsFilePath, 'utf8', (err, cartData) => {
        if (err) return res.status(500).json({ error: 'Error reading carts file' });
        const carts = JSON.parse(cartData);
        const cart = carts.find(c => c.id === cid);

        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        const productIndex = cart.products.findIndex(p => p.product === pid);
        if (productIndex === -1) return res.status(404).json({ error: 'Product not found in cart' });

        cart.products.splice(productIndex, 1);

        fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), 'utf8', (err) => {
            if (err) return res.status(500).json({ error: 'Error updating cart' });
            res.status(200).json(cart);
        });
    });
});

export default router;
