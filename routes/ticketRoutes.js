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

// Oppdaterer statusen til en ticket
// - Krever at brukeren er logget inn (via `isLoggedIn` middleware som brukes globalt i denne filen)
// - Krever at brukeren har rollen `admin` (via `restrictTo('admin')` middleware)
// - Bruker `ticketController.updateTicketStatus` for å håndtere oppdateringen

router.patch('/:id/status', 
    restrictTo('admin'), 
    ticketController.updateTicketStatus
);

// Oppdaterer prioriteten til en spesifikk ticket
// - Krever at brukeren er logget inn (via `isLoggedIn` middleware som brukes globalt i denne filen)
// - Krever at brukeren har rollen `admin` (via `restrictTo('admin')` middleware)
// - Bruker `ticketController.updateTicketPriority` for å håndtere oppdateringen

router.patch('/:id/priority', 
    restrictTo('admin'), 
    ticketController.updateTicketPriority
);

module.exports = router;