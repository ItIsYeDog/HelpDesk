const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/authMiddleware');

router.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('auth/login', { title: 'Logg inn' });
});

router.post('/login', authController.login);

router.get('/register', redirectIfLoggedIn, (req, res) => {
    res.render('auth/register', { title: 'Registrer deg' });
});

router.post('/register', authController.register);
router.get('/logout', authController.logout);

module.exports = router;