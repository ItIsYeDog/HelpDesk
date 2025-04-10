const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.redirectIfLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next();
        }

        if (user.role === 'admin') {
            return res.redirect('/dashboard/admin');
        }
        return res.redirect('/dashboard/user');
        
    } catch (err) {
        return next();
    }
};

exports.isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.redirect('/auth/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.redirect('/auth/login');
        }

        res.locals.user = user;
        req.user = user;

        if (req.originalUrl.startsWith('/dashboard/admin') && user.role !== 'admin') {
            return res.redirect('/dashboard/user');
        }

        if (req.originalUrl.startsWith('/dashboard/user') && user.role === 'admin') {
            return res.redirect('/dashboard/admin');
        }

        next();
    } catch (err) {
        console.error('Feil i isLoggedIn middleware:', err);
        res.redirect('/auth/login');
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.warn(`Tilgang nektet: Bruker med rolle "${req.user.role}" prøvde å få tilgang.`);
            return res.status(403).render('error', {
                title: 'Ingen tilgang',
                status: 403,
                message: 'Du har ikke tilgang til denne siden'
            });
        }
        next();
    };
};