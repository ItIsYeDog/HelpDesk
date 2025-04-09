const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const TicketHistory = require('../models/TicketHistory');
const User = require('../models/User');

exports.getNewTicketForm = (req, res) => {
    res.render('tickets/new', {
        title: 'Ny Ticket',
        categories: ['Hardware', 'Software', 'Network', 'Other'],
        user: req.user
    });
};

exports.createTicket = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        
        const ticket = await Ticket.create({
            title,
            description,
            category,
            status: 'Åpen',
            priority: 'Medium',
            createdBy: req.user._id
        });

        res.redirect('/dashboard/user');
    } catch (err) {
        res.render('tickets/new', {
            title: 'Ny Ticket',
            categories: ['Hardware', 'Software', 'Network', 'Other'],
            error: err.message
        });
    }
};

exports.getTicket = async (req, res) => {
    try {
        // Debug
        // console.log('Henter ticket med ID:', req.params.id);

        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('assignedTo', 'username role');

        if (!ticket) {
            // Debug
            // console.log('Ticket ikke funnet');
            return res.status(404).render('error', {
                title: 'Ikke funnet',
                status: 404,
                message: 'Ticket ikke funnet'
            });
        }

        // Debug
        // console.log('Ticket funnet:', ticket);

        const users = await User.find({ role: { $in: ['førsteLinjeSupport', 'andreLinjeSupport'] } });
        // Debug
        //console.log('Brukere med riktig rolle:', users);

        // Hent meldinger knyttet til ticketen
        const messages = await Message.find({ ticketId: ticket._id })
            .populate('sender', 'username')
            .sort('createdAt');

        // Debug
        // console.log('Meldinger knyttet til ticket:', messages);

        res.render('tickets/show', {
            title: `Ticket #${ticket._id.toString().slice(-6)}`,
            ticket,
            users,
            messages,
            user: req.user
        });
    } catch (err) {
        console.error('Feil under henting av ticket:', err);
        res.status(500).render('error', {
            title: 'Feil',
            status: 500,
            message: 'Noe gikk galt under henting av ticketen'
        });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket ikke funnet' });
        }

        // Oppdater status
        await TicketHistory.create({
            ticketId: ticket._id,
            updatedBy: req.user._id,
            changeType: 'status',
            oldValue: ticket.status,
            newValue: status
        });

        ticket.status = status;
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.json({ success: true, ticket });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateTicketPriority = async (req, res) => {
    try {
        const { priority } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket ikke funnet' });
        }

        // Oppdater prioritet
        await TicketHistory.create({
            ticketId: ticket._id,
            updatedBy: req.user._id,
            changeType: 'priority',
            oldValue: ticket.priority,
            newValue: priority
        });

        ticket.priority = priority;
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.json({ success: true, ticket });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const message = await Message.create({
            ticketId: req.params.id,
            sender: req.user._id,
            content: req.body.content
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username');

        req.app.get('io').to(`ticket-${req.params.id}`).emit('newMessage', populatedMessage);

        res.status(201).json({
            success: true,
            data: populatedMessage
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.getTicketChat = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('assignedTo', 'username');

        if (!ticket) {
            return res.status(404).render('error', {
                title: 'Ikke funnet',
                message: 'Ticket ikke funnet'
            });
        }

        const messages = await Message.find({ ticketId: ticket._id })
            .populate('sender', 'username')
            .sort('createdAt');

        res.render('tickets/show', {
            title: `Ticket #${ticket._id.toString().slice(-6)}`,
            ticket,
            messages,
            user: req.user
        });
    } catch (err) {
        res.status(500).render('error', {
            message: err.message
        });
    }
};

exports.getTicketHistory = async (req, res) => {
    try {
        const history = await TicketHistory.find({ ticketId: req.params.id })
            .populate('updatedBy', 'username')
            .sort('-createdAt');

        res.json({ success: true, history });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket ikke funnet' });
        }

        // Sjekk om ticket er løst
        if (ticket.status !== 'Løst') {
            return res.status(400).json({ message: 'Kun løste tickets kan slettes' });
        }

        // Slett ticket
        await ticket.remove();
        res.status(200).json({ message: 'Ticket slettet' });
    } catch (err) {
        console.error('Feil under sletting av ticket:', err);
        res.status(500).json({ message: 'Noe gikk galt under sletting av ticket' });
    }
};

exports.assignTicket = async (req, res) => {
    try {
        const { assignedTo } = req.body;

        // Hent ticket og populér assignedTo
        const ticket = await Ticket.findById(req.params.id).populate('assignedTo', 'username');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket ikke funnet' });
        }

        // Sjekk om brukeren som tildeles har riktig rolle
        const user = await User.findById(assignedTo);
        if (!user || !['førsteLinjeSupport', 'andreLinjeSupport'].includes(user.role)) {
            return res.status(400).json({ message: 'Brukeren har ikke riktig rolle for å bli tildelt denne ticketen' });
        }

        // Opprett historikkoppføring
        await TicketHistory.create({
            ticketId: ticket._id,
            updatedBy: req.user._id, // Brukeren som utførte tildelingen
            changeType: 'assignedTo',
            oldValue: ticket.assignedTo ? ticket.assignedTo.username : 'Ingen', // Tidligere tildelt bruker
            newValue: user.username // Ny tildelt bruker
        });

        // Tildel ticketen
        ticket.assignedTo = assignedTo;
        await ticket.save();

        res.status(200).json({ success: true, ticket });
    } catch (err) {
        console.error('Feil under tildeling av ticket:', err);
        res.status(500).json({ message: 'Noe gikk galt', error: err.message });
    }
};

exports.getFilteredTickets = async (req, res) => {
    try {
        const { status, priority, assignedTo, search } = req.query;

        // Bygg en dynamisk query basert på query parameters
        const query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }, // Søk i tittel
                { description: { $regex: search, $options: 'i' } } // Søk i beskrivelse
            ];
        }

        // Hent tickets basert på query
        const tickets = await Ticket.find(query)
            .populate('createdBy', 'username')
            .populate('assignedTo', 'username')
            .sort('-createdAt');

        const users = await User.find({ role: { $in: ['førsteLinjeSupport', 'andreLinjeSupport'] } });

        res.render('tickets/search', {
            title: 'Tickets',
            tickets,
            users,
            user: req.user
        });
    } catch (err) {
        console.error('Feil under henting av tickets:', err);
        res.status(500).render('error', {
            title: 'Feil',
            message: 'Noe gikk galt under henting av tickets'
        });
    }
};

exports.addFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket ikke funnet' });
        }

        // Sjekk om ticket er løst
        if (ticket.status !== 'Løst') {
            return res.status(400).json({ message: 'Tilbakemelding kan kun gis på løste tickets' });
        }

        // Legg til tilbakemelding
        ticket.feedback = { rating, comment };
        await ticket.save();

        res.status(200).json({ message: 'Tilbakemelding lagt til', ticket });
    } catch (err) {
        console.error('Feil under lagring av tilbakemelding:', err);
        res.status(500).json({ message: 'Noe gikk galt under lagring av tilbakemelding' });
    }
};