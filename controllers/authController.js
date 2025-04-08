const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
};

const getExpirationMs = (expiresIn) => {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch(unit) {
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        default: return 60 * 60 * 1000;
    }
};

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('auth/register', {
                title: 'Registrer deg',
                error: 'Brukernavn er allerede i bruk'
            });
        }

        const newUser = await User.create({
            username,
            password,
            role: 'user'
        });

        const token = signToken(newUser._id);
        
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + getExpirationMs(process.env.JWT_EXPIRES_IN || '1h')),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        if (newUser.role === 'admin') {
            res.redirect('/dashboard/admin');
        } else {
            res.redirect('/dashboard/user');
        }
    } catch (err) {
        res.render('auth/register', {
            title: 'Registrer deg',
            error: err.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const user = await User.findOne({ username });
        
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.render('auth/login', {
                title: 'Logg inn',
                error: 'Feil brukernavn eller passord'
            });
        }

        if (user.role !== role) {
            return res.render('auth/login', {
                title: 'Logg inn',
                error: 'Ugyldig rolle for denne brukeren'
            });
        }

        const token = signToken(user._id);
        
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + getExpirationMs(process.env.JWT_EXPIRES_IN || '1h')),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        if (user.role === 'admin') {
            res.redirect('/dashboard/admin');
        } else {
            res.redirect('/dashboard/user');
        }
    } catch (err) {
        res.render('auth/login', {
            title: 'Logg inn',
            error: err.message
        });
    }
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.redirect('/auth/login');
};