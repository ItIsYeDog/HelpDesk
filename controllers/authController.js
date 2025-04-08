const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generer JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Hardkoder verdien i stedet for å bruke env variabel
    });
};

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Sjekk om bruker eksisterer
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('auth/register', {
                title: 'Registrer deg',
                error: 'Brukernavn er allerede i bruk'
            });
        }

        // Opprett ny bruker
        const newUser = await User.create({
            username,
            password,
            role: 'user'
        });

        const token = signToken(newUser._id);
        
        // Fikset cookie options
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 time
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        // Redirect til dashboard basert på rolle
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

        // Sjekk om bruker eksisterer
        const user = await User.findOne({ username });
        
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.render('auth/login', {
                title: 'Logg inn',
                error: 'Feil brukernavn eller passord'
            });
        }

        // Sjekk om rollen matcher
        if (user.role !== role) {
            return res.render('auth/login', {
                title: 'Logg inn',
                error: 'Ugyldig rolle for denne brukeren'
            });
        }

        const token = signToken(user._id);
        
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 time
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        // Redirect basert på rolle
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