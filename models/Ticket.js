const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'En ticket må ha en tittel']
    },
    description: {
        type: String,
        required: [true, 'En ticket må ha en beskrivelse']
    },
    category: {
        type: String,
        required: [true, 'Velg en kategori'],
        enum: ['Hardware', 'Software', 'Network', 'Other']
    },
    status: {
        type: String,
        enum: ['Åpen', 'Under arbeid', 'Løst'],
        default: 'Åpen'
    },
    priority: {
        type: String,
        enum: ['Lav', 'Medium', 'Høy'],
        default: 'Medium'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);