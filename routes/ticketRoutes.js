const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { isLoggedIn, restrictTo } = require('../middleware/authMiddleware');

router.use(isLoggedIn);

router.get('/new', ticketController.getNewTicketForm);
router.post('/', ticketController.createTicket);
router.get('/:id', ticketController.getTicket);

router.post('/:id/messages', ticketController.createMessage);
router.get('/:id/chat', isLoggedIn, ticketController.getTicketChat);
router.get('/:id/history', isLoggedIn, ticketController.getTicketHistory);

router.patch('/:id/status', 
    restrictTo('admin'), 
    ticketController.updateTicketStatus
);
router.patch('/:id/priority', 
    restrictTo('admin'), 
    ticketController.updateTicketPriority
);

module.exports = router;