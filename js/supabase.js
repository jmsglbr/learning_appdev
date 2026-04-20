// Supabase Configuration
// !!! REPLACE THESE WITH YOUR ACTUAL SUPABASE VALUES !!!
const SUPABASE_URL = "https://ouzgznmfzvznntsprtui.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SAsy_3BXseQOmdZ-6wYClg_icuK5U3X";

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;
let currentRoom = null;
let allRooms = [];
let userProgress = [];
let allTasks = [];

// Show/hide loading
function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (show) {
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

// Show toast notification
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
        <span>${message}</span>
    `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
