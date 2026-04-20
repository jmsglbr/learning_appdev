// Authentication Functions

// Check if user is already logged in
async function checkSession() {
    showLoading(true);
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            await loadUserData();
            document.getElementById('authScreen').style.display = 'none';
            document.getElementById('mainApp').style.display = 'flex';
            if (typeof initializeApp === 'function') {
                await initializeApp();
            }
        }
    } catch (error) {
        console.error('Session check error:', error);
    } finally {
        showLoading(false);
    }
}

// Load user profile data
async function loadUserData() {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (profile) {
            const usernameElem = document.getElementById('sidebarUsername');
            const xpElem = document.getElementById('sidebarXP');
            const welcomeElem = document.getElementById('welcomeUsername');
            const avatarElem = document.getElementById('userAvatar');
            
            if (usernameElem) usernameElem.innerText = profile.username || currentUser.email.split('@')[0];
            if (xpElem) xpElem.innerText = (profile.xp || 0) + ' XP';
            if (welcomeElem) welcomeElem.innerText = profile.username || 'Learner';
            if (avatarElem) avatarElem.innerText = (profile.username || 'U')[0].toUpperCase();
        }
    } catch (error) {
        console.error('Load user data error:', error);
    }
}

// Register function
window.register = async function() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    
    if (!username || !email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { 
                data: { username: username }
            }
        });
        
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Account created! Please login.', 'success');
            // Switch to login tab
            document.querySelector('.auth-tab[data-tab="login"]').click();
            document.getElementById('loginEmail').value = email;
        }
    } catch (error) {
        showToast('Registration error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

// Login function
window.login = async function() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        });
        
        if (error) {
            showToast(error.message, 'error');
        } else {
            currentUser = data.user;
            await loadUserData();
            document.getElementById('authScreen').style.display = 'none';
            document.getElementById('mainApp').style.display = 'flex';
            if (typeof initializeApp === 'function') {
                await initializeApp();
            }
            showToast(`Welcome back!`, 'success');
        }
    } catch (error) {
        showToast('Login error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

// Logout function
window.logout = async function() {
    await supabase.auth.signOut();
    location.reload();
};

// Tab switching for auth forms
function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            
            if (loginForm) loginForm.classList.toggle('active', tabName === 'login');
            if (registerForm) registerForm.classList.toggle('active', tabName === 'register');
        });
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initAuthTabs();
    
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtnSidebar');
    
    if (loginBtn) loginBtn.addEventListener('click', window.login);
    if (registerBtn) registerBtn.addEventListener('click', window.register);
    if (logoutBtn) logoutBtn.addEventListener('click', window.logout);
    
    checkSession();
});
