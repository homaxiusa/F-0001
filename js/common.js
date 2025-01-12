// Error handling
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    // Add error reporting logic here
});

// Common utilities
const utils = {
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    showNotification(message, type = 'info') {
        // Add notification logic here
    }
};

// Authentication handling
const auth = {
    checkAuth() {
        // Add authentication check logic
    },
    
    logout() {
        // Add logout logic
    }
}; 