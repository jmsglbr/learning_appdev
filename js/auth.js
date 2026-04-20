// Authentication Functions

// Check if user is already logged in
async function checkSession() {
  showLoading(true);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    currentUser = session.user;
    await loadUserData();
    document.getElementById("authScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "flex";
    await initializeApp();
  } else {
    showLoading(false);
  }
}

// Load user profile data
async function loadUserData() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (profile) {
    document.getElementById("sidebarUsername").innerText =
      profile.username || currentUser.email.split("@")[0];
    document.getElementById("sidebarXP").innerText = (profile.xp || 0) + " XP";
    document.getElementById("welcomeUsername").innerText =
      profile.username || "Learner";
    document.getElementById("userAvatar").innerText = (profile.username ||
      "U")[0].toUpperCase();
  }
}

// Register function
async function register() {
  const username = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  if (!username || !email || !password) {
    showToast("Please fill all fields", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

  showLoading(true);

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { username: username },
    },
  });

  showLoading(false);

  if (error) {
    showToast(error.message, "error");
  } else {
    showToast("Account created! Please login.", "success");
    document.querySelector('.auth-tab[data-tab="login"]').click();
    document.getElementById("loginEmail").value = email;
  }
}

// Login function
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showToast("Please enter email and password", "error");
    return;
  }

  showLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  showLoading(false);

  if (error) {
    showToast(error.message, "error");
  } else {
    currentUser = data.user;
    await loadUserData();
    document.getElementById("authScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "flex";
    await initializeApp();
    showToast(`Welcome back, ${currentUser.email.split("@")[0]}!`, "success");
  }
}

// Logout function
async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

// Tab switching for auth forms
function initAuthTabs() {
  const tabs = document.querySelectorAll(".auth-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document
        .getElementById("loginForm")
        .classList.toggle("active", tabName === "login");
      document
        .getElementById("registerForm")
        .classList.toggle("active", tabName === "register");
    });
  });
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  initAuthTabs();
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("registerBtn").addEventListener("click", register);
  document.getElementById("logoutBtnSidebar").addEventListener("click", logout);

  checkSession();
});
