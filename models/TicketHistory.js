const mongoose = require('mongoose');

const ticketHistorySchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    changeType: {
        type: String,
        enum: ['status', 'priority', 'comment'],
        required: true
    },
    oldValue: String,
    newValue: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TicketHistory', ticketHistorySchema);