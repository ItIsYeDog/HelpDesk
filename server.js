const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
dotenv.config();

connectDB();

io.on('connection', (socket) => {
    socket.on('joinTicket', (ticketId) => {
        socket.join(`ticket-${ticketId}`);
    });
});

app.set('io', io);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    handler: (req, res) => {
        if (req.xhr || req.headers.accept.includes('application/json')) {
            res.status(429).json({
                status: 'error',
                message: 'For mange innloggingsforsøk. Vennligst prøv igjen senere.'
            });
        } else {
            res.status(429).render('auth/login', {
                title: 'Logg inn',
                error: 'For mange innloggingsforsøk. Vennligst prøv igjen senere.'
            });
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
        if (req.xhr || req.headers.accept.includes('application/json')) {
            res.status(429).json({
                status: 'error',
                message: 'For mange forespørsler. Vennligst prøv igjen senere.'
            });
        } else {
            res.redirect('back');
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/auth/login', loginLimiter);
app.use(['/dashboard', '/tickets'], generalLimiter);

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/tickets', ticketRoutes);

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

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});