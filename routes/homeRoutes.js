const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Hjem' });
});

router.get('/about', (req, res) => {
    res.render('about', { title: 'Om Helpdesk System' });
});

module.exports = router;