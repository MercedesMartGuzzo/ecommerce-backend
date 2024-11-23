import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; 
import mongoose from 'mongoose';
import app from './app.js'; 

// Configuración de conexión a MongoDB
const mongoURI = 'mongodb://localhost:27017/ecommerce'; 
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Conexión exitosa a MongoDB'))
    .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Configuración de WebSocket con Socket.io
const server = http.createServer(app); 
const io = new Server(server); 

io.on('connection', (socket) => {
    console.log('🔗 Nuevo cliente conectado');

    
    socket.on('newProduct', (product) => {
        console.log('📦 Nuevo producto recibido:', product);

        io.emit('updateProducts', product);
    });

    
    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🌐 Servidor escuchando en http://localhost:${PORT}`);
});
