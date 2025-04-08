const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

        // Gjør brukeren tilgjengelig i templates
        res.locals.user = user;
        req.user = user;
        next();
    } catch (err) {
        res.redirect('/auth/login');
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).render('error', {
                title: 'Ikke tilgang',
                message: 'Du har ikke tilgang til denne siden'
            });
        }
        next();
    };
};