const Ticket = require('../models/Ticket');
const User = require('../models/User');

exports.getUserDashboard = async (req, res) => {
    try {
        let tickets;

        if (req.user.role === 'user') {
            // Vanlige brukere ser tickets de har opprettet
            tickets = await Ticket.find({ createdBy: req.user._id }).sort('-createdAt');
        } else if (['førsteLinjeSupport', 'andreLinjeSupport'].includes(req.user.role)) {
            // Support-brukere ser tickets som er tildelt dem
            tickets = await Ticket.find({ assignedTo: req.user._id }).sort('-createdAt');
        } else {
            // Hvis rollen ikke er definert, returner tom liste
            tickets = [];
        }

        res.render('dashboard/user', {
            title: 'Mitt Dashboard',
            tickets
        });
    } catch (err) {
        console.error('Feil under henting av dashboard:', err);
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

exports.getUserManagement = async (req, res) => {
    try {
        const users = await User.find().sort('username');
        res.render('admin/userManagement', {
            title: 'Brukeradministrasjon',
            users,
            user: req.user
        });
    } catch (err) {
        res.status(500).render('error', {
            title: 'Feil',
            message: 'Noe gikk galt under henting av brukere'
        });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Bruker ikke funnet' });
        }

        if (!['user', 'admin', 'førsteLinjeSupport', 'andreLinjeSupport'].includes(role)) {
            return res.status(400).json({ message: 'Ugyldig rolle' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: 'Noe gikk galt', error: err.message });
    }
};

exports.getSupportDashboard = async (req, res) => {
    try {
        // Hent tickets som er tildelt support-brukeren
        const tickets = await Ticket.find({ assignedTo: req.user._id })
            .populate('createdBy', 'username')
            .sort('-createdAt');

        res.render('dashboard/support', {
            title: 'Support Dashboard',
            tickets
        });
    } catch (err) {
        console.error('Feil under henting av support-dashboard:', err);
        res.status(500).render('error', {
            message: 'Kunne ikke hente support-dashboard'
        });
    }
};