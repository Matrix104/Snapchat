document.addEventListener('DOMContentLoaded', () => {
    // --- !!! IMPORTANT: REPLACE WITH YOUR DEPLOYED APPS SCRIPT WEB APP URL !!! ---
    const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCmHlGkESE8l8MjKx90F9GT0Hfu4UQrc7NlKCBdKR-YG7CxQsxG2El4mLLgJM2zvzJ/exec';
    // Example: const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/ABCDEFG1234567/exec';


    // Primary Login Elements
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessageElement = document.getElementById('loginMessage');
    const primaryLoginButton = loginForm.querySelector('.login-button');
    const togglePasswordButton = document.getElementById('togglePassword');

    // 2FA Elements
    const twoFactorAuthContainer = document.getElementById('twoFactorAuthContainer');
    const otpForm = document.getElementById('otpForm');
    const otpInput = document.getElementById('otp');
    const otpMessageElement = document.getElementById('otpMessage');
    const verifyOtpButton = document.getElementById('verifyOtpButton');

    let currentUsernameForOtp = '';

    // --- Password visibility toggle ---
    if (togglePasswordButton) {
        const eyeIcon = togglePasswordButton.querySelector('.eye-icon');
        const eyeSlashIcon = togglePasswordButton.querySelector('.eye-slash-icon');
        togglePasswordButton.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            if (isPassword) {
                passwordInput.setAttribute('type', 'text');
                eyeIcon.style.display = 'none';
                eyeSlashIcon.style.display = 'inline-block';
                togglePasswordButton.setAttribute('aria-label', 'Hide password');
            } else {
                passwordInput.setAttribute('type', 'password');
                eyeIcon.style.display = 'inline-block';
                eyeSlashIcon.style.display = 'none';
                togglePasswordButton.setAttribute('aria-label', 'Show password');
            }
        });
    }

    // --- Primary Login Form Submission ---
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!APPS_SCRIPT_WEB_APP_URL || APPS_SCRIPT_WEB_APP_URL === 'YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE') {
            showMessage(loginMessageElement, 'Error: Apps Script Web App URL not configured in script.js.', 'error');
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage(loginMessageElement, 'Please enter both username and password.', 'error');
            return;
        }

        currentUsernameForOtp = username;
        const originalButtonText = primaryLoginButton.textContent;
        primaryLoginButton.disabled = true;
        primaryLoginButton.textContent = 'Logging In...';
        showMessage(loginMessageElement, '', 'info');

        const loginParams = new URLSearchParams();
        loginParams.append('action', 'login');
        loginParams.append('username', username);
        loginParams.append('password', password); // INSECURE: Password in GET

        const loginApiUrlWithParams = `${APPS_SCRIPT_WEB_APP_URL}?${loginParams.toString()}`;
        console.log('Attempting primary login GET request to:', loginApiUrlWithParams);

        try {
            const response = await fetch(loginApiUrlWithParams, {
                method: 'GET', // Apps Script web apps typically handle GET
                // mode: 'cors' // Usually not needed if Apps Script is set to "Anyone"
            });

            const data = await response.json(); // Apps Script returns JSON
            console.log('Primary login response:', data);

            if (data.success && data.twoFactorRequired) {
                showOtpForm();
                showMessage(otpMessageElement, data.message, 'info'); // Show server message on OTP form
            } else {
                primaryLoginButton.disabled = false;
                primaryLoginButton.textContent = originalButtonText;
                showMessage(loginMessageElement, data.message || 'Login failed.', 'error');
            }
        } catch (error) {
            primaryLoginButton.disabled = false;
            primaryLoginButton.textContent = originalButtonText;
            console.error('Network or other error during primary login:', error);
            showMessage(loginMessageElement, `An error occurred: ${error.message}. Check console.`, 'error');
        }
    });

    // --- Function to show OTP form and hide login form ---
    function showOtpForm() {
        loginForm.classList.add('hidden');
        twoFactorAuthContainer.classList.remove('hidden');
        otpInput.focus();
        showMessage(loginMessageElement, '', 'info');
    }

    // --- OTP Form Submission ---
    otpForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!APPS_SCRIPT_WEB_APP_URL || APPS_SCRIPT_WEB_APP_URL === 'YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE') {
            showMessage(otpMessageElement, 'Error: Apps Script Web App URL not configured in script.js.', 'error');
            return;
        }

        const otpValue = otpInput.value.trim();

        if (!otpValue) {
            showMessage(otpMessageElement, 'Please enter the verification code.', 'error');
            return;
        }

        const originalButtonText = verifyOtpButton.textContent;
        verifyOtpButton.disabled = true;
        verifyOtpButton.textContent = 'Verifying...';
        showMessage(otpMessageElement, '', 'info');

        const otpParams = new URLSearchParams();
        otpParams.append('action', 'verifyOtp');
        otpParams.append('username', currentUsernameForOtp);
        otpParams.append('otp', otpValue); // INSECURE: OTP in GET

        const otpApiUrlWithParams = `${APPS_SCRIPT_WEB_APP_URL}?${otpParams.toString()}`;
        console.log('Attempting OTP verification GET request to:', otpApiUrlWithParams);

        try {
            const response = await fetch(otpApiUrlWithParams, {
                method: 'GET',
            });

            const data = await response.json();
            console.log('OTP Verification response:', data);

            if (data.success) {
                showMessage(otpMessageElement, 'Verification successful! Redirecting...', 'success');
                // Redirect to example.com
                setTimeout(() => { // Add a small delay so user can see success message
                    window.location.href = 'http://neal.fun';
                }, 1500);
            } else {
                verifyOtpButton.disabled = false;
                verifyOtpButton.textContent = originalButtonText;
                showMessage(otpMessageElement, data.message || 'OTP verification failed.', 'error');
            }
        } catch (error) {
            verifyOtpButton.disabled = false;
            verifyOtpButton.textContent = originalButtonText;
            console.error('Network or other error during OTP verification:', error);
            showMessage(otpMessageElement, `An error occurred: ${error.message}. Check console.`, 'error');
        }
    });

    // --- Helper to show messages ---
    function showMessage(element, msg, type = 'info') {
        element.textContent = msg;
        element.className = `message ${type}`;
    }
});
