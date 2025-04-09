const express = require('express');
const { isLoggedIn } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Hjem' });
});

router.get('/about', (req, res) => {
    res.render('about', { title: 'Om Helpdesk System' });
});

router.get('/manual', isLoggedIn, (req, res) => {
    res.render('manual', { 
        title: 'Brukermanual', 
        user: req.user, 
        role: req.user.role
    });
});

module.exports = router;