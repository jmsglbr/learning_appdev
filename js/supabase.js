// Supabase Configuration
// !!! REPLACE THESE WITH YOUR ACTUAL SUPABASE VALUES !!!
const SUPABASE_URL = "https://app_dev-platform.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SAsy_3BXseQOmdZ-6wYClg_icuK5U3X";  // ← PUT YOUR REAL KEY HERE!

// Initialize Supabase client (ONLY ONCE)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;
let currentRoom = null;
let allRooms = [];
let userProgress = [];
let allTasks = [];

// Make supabase available globally
window.supabase = supabaseClient;

// Show/hide loading
window.showLoading = function(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
};

// Show toast notification
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Export for other files
window.currentUser = currentUser;
window.currentRoom = currentRoom;
window.allRooms = allRooms;
window.userProgress = userProgress;
window.allTasks = allTasks;
