import express from 'express';
import path from 'path';
import exphbs from 'express-handlebars';

const app = express();

// Configuración de Handlebars
const hbs = exphbs.create({});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(process.cwd(), 'public')));

// Rutas
app.get('/', (req, res) => {
    res.render('home'); 
});

app.get('/realtime-products', (req, res) => {
    res.render('realtimeProducts'); 
});

export default app;
