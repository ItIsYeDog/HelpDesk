module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Ny WebSocket-tilkobling');

        // Håndterer at en bruker blir med i en billett
        socket.on('joinTicket', (ticketId) => {
            console.log(`Bruker ble med i rommet: ticket-${ticketId}`);
            socket.join(`ticket-${ticketId}`);
        });

        // Håndterer frakobling
        socket.on('disconnect', () => {
            console.log('Bruker frakoblet');
        });
    });
};