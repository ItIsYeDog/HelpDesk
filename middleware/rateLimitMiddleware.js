const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
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

module.exports = {
    loginLimiter,
    generalLimiter,
};