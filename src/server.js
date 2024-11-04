import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; 
import path from 'path';
import exphbs from 'express-handlebars';
import app from './app.js'; 

const server = http.createServer(app); 
const io = new Server(server); 

// Configuración de WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
    socket.on('newProduct', (product) => {
        io.emit('updateProducts', product);
    });
});

// Inicializar el servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
