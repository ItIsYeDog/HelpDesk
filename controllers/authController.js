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
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
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
        const { username, password } = req.body;

        // Finn brukeren basert på brukernavn
        const user = await User.findOne({ username });

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).render('auth/login', {
                title: 'Logg inn',
                error: 'Ugyldig brukernavn eller passord'
            });
        }

        // Opprett JWT-token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Konverter JWT_COOKIE_EXPIRES_IN til millisekunder
        const cookieExpiresInMs = getExpirationMs(process.env.JWT_COOKIE_EXPIRES_IN || '7d');

        // Sett token som cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieExpiresInMs
        });

        // Omdiriger basert på brukerens rolle
        if (user.role === 'admin') {
            return res.redirect('/dashboard/admin');
        } else {
            return res.redirect('/dashboard/user');
        }
    } catch (err) {
        console.error('Feil under innlogging:', err);
        res.status(500).render('auth/login', {
            title: 'Logg inn',
            error: 'Noe gikk galt under innlogging. Prøv igjen senere.'
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