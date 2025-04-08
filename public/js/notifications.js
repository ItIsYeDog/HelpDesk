function showNotification(message) {
    const notification = document.createElement('div');
    
    // Style the notification
    notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 shadow-lg transform transition-all duration-500 translate-x-full';
    
    // Add content
    notification.innerHTML = `
        <div class="flex items-center">
            <svg class="h-5 w-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm font-medium">${message}</p>
        </div>
    `;

    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}