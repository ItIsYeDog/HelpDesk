const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const { loginLimiter, generalLimiter } = require('./middleware/rateLimitMiddleware');
const http = require('http');
const socketIo = require('socket.io');
const socketHandler = require('./utils/socketHandler');
const methodOverride = require('method-override');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

connectDB();

socketHandler(io);

app.set('io', io);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Legge til rate limiting
app.use('/auth/login', loginLimiter);
app.use(['/dashboard', '/tickets'], generalLimiter);

// Ruter
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/tickets', ticketRoutes);

// Håndtere 404 og feil
app.use((req, res, next) => {
    res.status(404).render('error', {
        title: 'Ikke funnet',
        status: 404,
        message: 'Siden du leter etter ble ikke funnet',
        error: null
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = status === 404 
        ? 'Siden du leter etter ble ikke funnet'
        : 'Beklager, noe gikk galt';

    res.status(status).render('error', {
        title: status === 404 ? 'Ikke funnet' : 'Feil',
        status: status,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err : null
    });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});