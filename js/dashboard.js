document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeSearch();
    initializeRealTimeUpdates();
});

function initializeMap() {
    const markers = document.querySelectorAll('.marker');
    markers.forEach(marker => {
        marker.addEventListener('click', (e) => {
            const title = e.target.getAttribute('title');
            showMarkerDetails(title);
        });
    });
}

function initializeSearch() {
    const searchInput = document.querySelector('.search-input input');
    const filters = document.querySelectorAll('.filter-item select');
    
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    filters.forEach(filter => {
        filter.addEventListener('change', handleFilters);
    });
}

function initializeRealTimeUpdates() {
    // Update alerts every 30 seconds
    setInterval(updateAlerts, 30000);
    
    // Update statistics every minute
    setInterval(updateStatistics, 60000);
}

function showMarkerDetails(title) {
    // Add marker details display logic
}

function handleSearch(event) {
    // Add search logic
}

function handleFilters(event) {
    // Add filter logic
}

function updateAlerts() {
    // Add real-time alerts update logic
}

function updateStatistics() {
    // Add statistics update logic
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 