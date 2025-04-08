const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Logg inn' });
});

router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Registrer deg' });
});

router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;