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
            const error = new Error('Du har ikke tilgang til denne siden');
            error.status = 403;
            return next(error);
        }
        next();
    };
};