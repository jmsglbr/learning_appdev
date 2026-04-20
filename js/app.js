// Main Application Initialization

async function initializeApp() {
  showLoading(true);

  await loadProgress();
  await renderRooms();
  await loadDashboardStats();

  initNavigation();
  initTerminal();

  showLoading(false);
  showToast("Ready to learn! Choose a room to start.", "info");
}

// Load all necessary data
async function loadAllData() {
  await loadProgress();
  await renderRooms();
  await loadDashboardStats();
}

// Export functions to global scope
window.openRoom = openRoom;
window.checkTask = checkTask;
window.navigateTo = navigateTo;
window.showToast = showToast;

// Initial load when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Auth is handled in auth.js
  console.log("DevHackMe initialized");
});
