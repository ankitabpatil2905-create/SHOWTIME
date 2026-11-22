/**
 * SHOWTIME - Authentication Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect
    if (Auth.isLoggedIn()) {
        const u = Auth.getUser();
        if (u.role === 'ADMIN') window.location.href = 'admin.html';
        else window.location.href = 'home.html';
        return;
    }

    setupTabs();
    setupPasswordToggles();
    setupForms();
});

function setupTabs() {
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const headerTitle = document.getElementById('auth-title');
    const headerSub = document.getElementById('auth-subtitle');

    if (!loginTab || !registerTab) return;

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        headerTitle.textContent = 'Welcome to SHOWTIME';
        headerSub.textContent = 'Sign in to access your cinema tickets and bookings';
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        headerTitle.textContent = 'Create SHOWTIME Account';
        headerSub.textContent = 'Join SHOWTIME for quick booking, favorites, and offers';
    });
}

function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const inputId = btn.getAttribute('data-target');
            const input = document.getElementById(inputId);
            if (!input) return;

            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });
}

function setupForms() {
    // Login form
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                Toast.show('Please enter both email and password.', 'warning');
                return;
            }

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';

            try {
                const res = await Api.login(email, password);
                if (res.success) {
                    Auth.setUser(res);
                    Toast.show('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        if (res.role === 'ADMIN') window.location.href = 'admin.html';
                        else window.location.href = 'home.html';
                    }, 800);
                } else {
                    Toast.show(res.message || 'Login failed', 'warning');
                }
            } catch (err) {
                Toast.show(err.message || 'Login failed. Please check credentials.', 'warning');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('form-register');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm').value;

            if (!fullName || !email || !phone || !password || !confirmPassword) {
                Toast.show('Please fill in all registration fields.', 'warning');
                return;
            }
            if (password !== confirmPassword) {
                Toast.show('Passwords do not match.', 'warning');
                return;
            }
            if (password.length < 6) {
                Toast.show('Password should be at least 6 characters.', 'warning');
                return;
            }

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            try {
                const res = await Api.register(fullName, email, phone, password, confirmPassword);
                if (res.success) {
                    Auth.setUser(res);
                    Toast.show('Account created successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 900);
                } else {
                    Toast.show(res.message || 'Registration failed', 'warning');
                }
            } catch (err) {
                Toast.show(err.message || 'Registration failed. Try a different email.', 'warning');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    }
}

// Quick autofill for evaluation convenience
window.fillCredentials = function(email, password) {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (emailInput && passInput) {
        emailInput.value = email;
        passInput.value = password;
        Toast.show(`Credentials filled: ${email}`, 'info');
    }
};
