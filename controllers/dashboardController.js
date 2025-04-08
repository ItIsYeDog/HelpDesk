const Ticket = require('../models/Ticket');

exports.getUserDashboard = async (req, res) => {
    try {
        const tickets = await Ticket.find({ createdBy: req.user._id })
            .sort('-createdAt');

        res.render('dashboard/user', {
            title: 'Mitt Dashboard',
            tickets
        });
    } catch (err) {
        res.status(500).render('error', {
            message: 'Kunne ikke hente dashboard'
        });
    }
};

exports.getAdminDashboard = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('createdBy', 'username')
            .sort('-createdAt');

        const stats = {
            total: tickets.length,
            open: tickets.filter(ticket => ticket.status === 'Åpen').length,
            inProgress: tickets.filter(ticket => ticket.status === 'Under arbeid').length,
            resolved: tickets.filter(ticket => ticket.status === 'Løst').length
        };

        res.render('dashboard/admin', {
            title: 'Admin Dashboard',
            tickets,
            stats
        });
    } catch (err) {
        res.status(500).render('error', {
            message: 'Kunne ikke hente dashboard'
        });
    }
};