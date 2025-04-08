const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const TicketHistory = require('../models/TicketHistory');

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
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('assignedTo', 'username');

        if (!ticket) {
            return res.status(404).render('error', {
                title: 'Ikke funnet',
                message: 'Ticket ikke funnet'
            });
        }

        // Fetch messages for this ticket
        const messages = await Message.find({ ticketId: ticket._id })
            .populate('sender', 'username')
            .sort('createdAt');

        // Sjekk om brukeren har tilgang til ticketen
        if (req.user.role !== 'admin' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).render('error', {
                title: 'Ikke tilgang',
                message: 'Du har ikke tilgang til denne ticketen'
            });
        }

        res.render('tickets/show', {
            title: 'Ticket Detaljer',
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

exports.updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        
        // Create history entry
        await TicketHistory.create({
            ticketId: ticket._id,
            updatedBy: req.user._id,
            changeType: 'status',
            oldValue: ticket.status,
            newValue: status
        });

        // Update ticket
        ticket.status = status;
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.json({ success: true, ticket });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.updateTicketPriority = async (req, res) => {
    try {
        const { priority } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        
        // Create history entry
        await TicketHistory.create({
            ticketId: ticket._id,
            updatedBy: req.user._id,
            changeType: 'priority',
            oldValue: ticket.priority,
            newValue: priority
        });

        // Update ticket
        ticket.priority = priority;
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.json({ success: true, ticket });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
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

        // Fetch messages for this ticket
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