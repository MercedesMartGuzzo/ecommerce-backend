import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io'; 
import exphbs from 'express-handlebars';

const app = express();
const server = http.createServer(app); 
const io = new Server(server);


app.use(express.static(path.join(process.cwd(), 'public')));

// Configuración de Handlebars
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), 'views'));

// Middleware para manejar datos JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
import productsRoutes from './routes/productsRoutes.js';
import cartsRoutes from './routes/cartsRoutes.js';
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

// Configuración de WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
    socket.on('newProduct', (product) => {
        io.emit('updateProducts', product);
    });
});


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
