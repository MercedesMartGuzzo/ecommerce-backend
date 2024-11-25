import express from 'express';
import path from 'path';
import exphbs from 'express-handlebars';
import fs from 'fs/promises';
import cartRoutes from './routes/cartsRoutes.js';

const app = express();

// Configuración de Handlebars
const hbs = exphbs.create({
    defaultLayout: null,
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), 'src', 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));


app.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(process.cwd(), 'data', 'products.json'), 'utf-8');
        const products = JSON.parse(data);
        res.render('home', { products });
    } catch (error) {
        console.error('Error leyendo el archivo products.json:', error);
        res.status(500).send('Error al cargar los productos');
    }
});


app.post('/products/:id/add-to-cart', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).send('Cantidad inválida');
        }

        const productsData = await fs.readFile(path.join(process.cwd(), 'data', 'products.json'), 'utf-8');
        const products = JSON.parse(productsData);
        const product = products.find(prod => prod.id === id);
        
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        const cartsData = await fs.readFile(path.join(process.cwd(), 'data', 'carts.json'), 'utf-8');
        const carts = JSON.parse(cartsData);

        let cart = carts.find(cart => cart.id === '1');
        if (!cart) {
            cart = { id: '1', products: [] };
            carts.push(cart);
        }

        const productInCart = cart.products.find(p => p.productId === id);
        if (productInCart) {
            productInCart.quantity += parseInt(quantity, 10);
        } else { 
            cart.products.push({ productId: id, quantity: parseInt(quantity, 10) });
        }

        await fs.writeFile(path.join(process.cwd(), 'data', 'carts.json'), JSON.stringify(carts, null, 2));
        
        res.redirect(`/cart/1`);
    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error);
        res.status(500).send('Error al agregar el producto al carrito');
    }
});


app.get('/cart/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const cartsData = await fs.readFile(path.join(process.cwd(), 'data', 'carts.json'), 'utf-8');
        const carts = JSON.parse(cartsData);

        const cart = carts.find(cart => cart.id === id);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        const productsData = await fs.readFile(path.join(process.cwd(), 'data', 'products.json'), 'utf-8');
        const products = JSON.parse(productsData);

        const cartProducts = cart.products.map(item => {
            const product = products.find(p => p.id === item.productId);
            return { 
                ...product, 
                quantity: item.quantity 
            };
        });

        const totalPrice = cartProducts.reduce((total, product) => total + (product.price * product.quantity), 0);

        res.render('carts', { 
            products: cartProducts,
            totalPrice: totalPrice
        });
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        res.status(500).send('Error al cargar el carrito');
    }
});

app.post('/cart/:id/remove/:productId', async (req, res) => {
    const { id, productId } = req.params;

    try {
        const cartsData = await fs.readFile(path.join(process.cwd(), 'data', 'carts.json'), 'utf-8');
        const carts = JSON.parse(cartsData);

        const cart = carts.find(cart => cart.id === id);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        cart.products = cart.products.filter(item => item.productId !== productId);

        await fs.writeFile(path.join(process.cwd(), 'data', 'carts.json'), JSON.stringify(carts, null, 2));

        res.redirect(`/cart/${id}`);
    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error);
        res.status(500).send('Error al eliminar el producto');
    }
});


app.post('/cart/:id/clear', async (req, res) => {
    const { id } = req.params;
    try {
        const cartsData = await fs.readFile(path.join(process.cwd(), 'data', 'carts.json'), 'utf-8');
        const carts = JSON.parse(cartsData);
        const cart = carts.find(cart => cart.id === id);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        cart.products = [];
        await fs.writeFile(path.join(process.cwd(), 'data', 'carts.json'), JSON.stringify(carts, null, 2));
        res.redirect(`/cart/${id}`);
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        res.status(500).send('Error al vaciar el carrito');
    }
});


app.use('/cart', cartRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});

export default app;