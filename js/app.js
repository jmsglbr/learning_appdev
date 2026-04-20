// Main Application Initialization

window.initializeApp = async function() {
    showLoading(true);
    
    try {
        await loadProgress();
        if (typeof renderRooms === 'function') await renderRooms();
        if (typeof loadDashboardStats === 'function') await loadDashboardStats();
        
        if (typeof initNavigation === 'function') initNavigation();
        if (typeof initTerminal === 'function') initTerminal();
        
        showToast('Ready to learn! Choose a room to start.', 'info');
    } catch (error) {
        console.error('Initialize error:', error);
        showToast('Error loading data. Please refresh.', 'error');
    } finally {
        showLoading(false);
    }
};

// Load all necessary data
window.loadAllData = async function() {
    await loadProgress();
    if (typeof renderRooms === 'function') await renderRooms();
    if (typeof loadDashboardStats === 'function') await loadDashboardStats();
};

// Make sure these are available globally
window.currentUser = currentUser;
window.currentRoom = currentRoom;
window.allRooms = allRooms;
window.userProgress = userProgress;
window.allTasks = allTasks;

console.log('AppDev initialized');
