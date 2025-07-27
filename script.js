document.addEventListener('DOMContentLoaded', () => {
    
    // --- INITIALIZATION ---
    // Generate captchas for both forms on page load
    generateCaptcha('login');
    generateCaptcha('reg');
    
    // Update the date, time, and greeting immediately
    updateDateTime();
    // And then update it every minute
    setInterval(updateDateTime, 60000);

    // Render the balance chart
    renderBalanceChart();

    // Attach event listener for the referral code box
    const referralCodeBox = document.querySelector('.referral-code-box');
    if (referralCodeBox) {
        referralCodeBox.addEventListener('click', () => copyReferralCode(referralCodeBox));
    }

    // --- Event listener for phone number inputs to allow only numbers ---
    const phoneInputs = [document.getElementById('login-phone'), document.getElementById('reg-phone')];
    phoneInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                // Replace any character that is not a digit with an empty string
                input.value = input.value.replace(/[^0-9]/g, '');
            });
        }
    });
});


// --- GLOBAL STATE ---
// Store the current captcha codes
const captchaState = {
    login: '',
    reg: ''
};


// --- AUTHENTICATION ---

/**
 * Toggles between the login and register forms.
 * @param {'login' | 'register'} formToShow - The form to display.
 */
function showForm(formToShow) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (formToShow === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        generateCaptcha('login'); // Generate a new captcha when switching to login
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        generateCaptcha('reg'); // Generate a new captcha when switching to register
    }
}

/**
 * Generates a random alphanumeric string for the captcha.
 * @param {number} length - The desired length of the string.
 * @returns {string} The random string.
 */
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generates and displays a new captcha for the specified form.
 * @param {'login' | 'reg'} formPrefix - The prefix for the form elements.
 */
function generateCaptcha(formPrefix) {
    const newCaptcha = generateRandomString(6);
    captchaState[formPrefix] = newCaptcha;
    document.getElementById(`${formPrefix}-captcha-text`).textContent = newCaptcha;
}

/**
 * Displays an error message for a form.
 * @param {string} formPrefix - The prefix for the form ('login' or 'register').
 * @param {string} message - The error message to display.
 */
function showAuthError(formPrefix, message) {
    const errorEl = document.getElementById(`${formPrefix}-error`);
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

/**
 * Hides the error message for a form.
 * @param {string} formPrefix - The prefix for the form ('login' or 'register').
 */
function hideAuthError(formPrefix) {
    const errorEl = document.getElementById(`${formPrefix}-error`);
    errorEl.classList.remove('show');
}

/**
 * Simulates the login process.
 */
function login() {
    hideAuthError('login');
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    const captchaInput = document.getElementById('login-captcha-input').value;

    if (!phone || !password || !captchaInput) {
        showAuthError('login', 'All fields are required.');
        return;
    }

    if (captchaInput.toUpperCase() !== captchaState.login) {
        showAuthError('login', 'Verification code is incorrect.');
        generateCaptcha('login'); // Get a new code after a failed attempt
        return;
    }
    
    // On successful login:
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');
}

/**
 * Simulates the registration process.
 */
function register() {
    hideAuthError('register');
    const fullName = document.getElementById('reg-fullname').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const captchaInput = document.getElementById('reg-captcha-input').value;

    if (!fullName || !phone || !password || !captchaInput) {
        showAuthError('register', 'Full name, phone, password, and verification are required.');
        return;
    }
    if (password.length < 6) {
        showAuthError('register', 'Password must be at least 6 characters long.');
        return;
    }
    if (captchaInput.toUpperCase() !== captchaState.reg) {
        showAuthError('register', 'Verification code is incorrect.');
        generateCaptcha('reg');
        return;
    }

    // On successful registration, switch to login form
    // In a real app, you might auto-login or show a success message.
    alert('Registration successful! Please log in.');
    showForm('login');
}

/**
 * Simulates logging out.
 */
function logout() {
    document.getElementById('dashboard-page').classList.add('hidden');
    document.getElementById('auth-page').classList.remove('hidden');
    // Reset forms for next login
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    generateCaptcha('login');
}


// --- DASHBOARD UI & NAVIGATION ---

/**
 * Updates the greeting and date/time display.
 */
function updateDateTime() {
    const now = new Date(); // Use the user's current time
    const hour = now.getHours();
    
    // Set greeting
    const greetingEl = document.getElementById('greeting');
    let greetingText = 'Good Evening';
    if (hour < 12) {
        greetingText = 'Good Morning';
    } else if (hour < 18) {
        greetingText = 'Good Afternoon';
    }
    // In a real app, you'd fetch the user's name
    greetingEl.textContent = `${greetingText}, User!`;

    // Set date and time
    const dateTimeEl = document.getElementById('current-date-time');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    dateTimeEl.textContent = now.toLocaleDateString('en-US', options);
}

/**
 * Switches between dashboard pages.
 * @param {string} pageId - The ID of the page to show.
 * @param {HTMLElement} navElement - The clicked navigation link element.
 */
function showPage(pageId, navElement) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    // Show the target page
    document.getElementById(pageId).classList.add('active');

    // Update active state on nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    navElement.classList.add('active');
}

/**
 * Renders the balance history chart using Chart.js.
 */
function renderBalanceChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(74, 105, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(74, 105, 255, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Balance (ETB)',
                data: [1000, 1500, 1200, 1800, 2500, 2200, 3000],
                backgroundColor: gradient,
                borderColor: '#4a69ff',
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4a69ff',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { color: 'rgba(224, 224, 224, 0.1)', borderColor: 'rgba(224, 224, 224, 0.1)' } },
                y: { grid: { color: 'rgba(224, 224, 224, 0.1)', borderColor: 'rgba(224, 224, 224, 0.1)' } }
            }
        }
    });
}


// --- MODALS ---

/**
 * Displays a confirmation modal for investments.
 * @param {string} planName - The name of the investment plan.
 * @param {number} amount - The investment amount.
 */
function showInvestModal(planName, amount) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">Confirm Investment</h3>
            <button class="modal-close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <p>You are about to invest <b>${amount} ETB</b> in the <b>${planName}</b> plan.</p>
            <p>This action will deduct the amount from your total balance. Do you wish to proceed?</p>
        </div>
        <div class="modal-footer">
            <button class="modal-button cancel" onclick="closeModal()">Cancel</button>
            <button class="modal-button confirm" onclick="confirmInvestment('${planName}', ${amount})">Confirm</button>
        </div>
    `;
    modalOverlay.classList.remove('hidden');
}

/**
 * Closes the currently active modal.
 */
function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

/**
 * Simulates confirming an investment.
 * @param {string} planName - The name of the plan.
 * @param {number} amount - The investment amount.
 */
function confirmInvestment(planName, amount) {
    alert(`Successfully invested ${amount} ETB in the ${planName} plan!`);
    closeModal();
}


// --- DEPOSIT FLOW ---

function proceedToDeposit() {
    const amountInput = document.getElementById('deposit-amount');
    const errorEl = document.getElementById('deposit-error');
    const amount = parseInt(amountInput.value, 10);
    const min = parseInt(amountInput.min, 10);
    const max = parseInt(amountInput.max, 10);

    if (!amount || amount < min || amount > max) {
        errorEl.textContent = `Please enter an amount between ${min} and ${max} ETB.`;
        errorEl.classList.add('show');
        return;
    }

    errorEl.classList.remove('show');
    document.getElementById('deposit-amount-display').textContent = `${amount} ETB`;
    document.getElementById('deposit-step-1').classList.add('hidden');
    document.getElementById('deposit-step-2').classList.remove('hidden');
}

function updateFileName(input) {
    const fileNameDisplay = document.getElementById('file-name-display');
    if (input.files.length > 0) {
        fileNameDisplay.textContent = input.files[0].name;
    } else {
        fileNameDisplay.textContent = 'No file chosen';
    }
}

function submitDepositRequest() {
    document.getElementById('deposit-step-2').classList.add('hidden');
    document.getElementById('deposit-step-3').classList.remove('hidden');
}

function resetDepositFlow() {
    document.getElementById('deposit-step-1').classList.remove('hidden');
    document.getElementById('deposit-step-2').classList.add('hidden');
    document.getElementById('deposit-step-3').classList.add('hidden');
    
    // Reset form fields
    document.getElementById('deposit-amount').value = '';
    document.getElementById('deposit-screenshot').value = '';
    document.getElementById('file-name-display').textContent = 'No file chosen';
}


// --- COPY & SHARE ---

/**
 * A helper function to provide visual feedback on a button after copying.
 * @param {HTMLElement} buttonElement - The button that was clicked.
 * @param {string} originalHTML - The original inner HTML of the button.
 */
function showCopyFeedback(buttonElement, originalHTML) {
    buttonElement.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
    buttonElement.classList.add('copied');
    buttonElement.disabled = true;

    setTimeout(() => {
        buttonElement.innerHTML = originalHTML;
        buttonElement.classList.remove('copied');
        buttonElement.disabled = false;
    }, 2000);
}

/**
 * Copies a given text to the clipboard and provides feedback on the button.
 * @param {string} text - The text to copy.
 * @param {HTMLElement} buttonElement - The button that was clicked.
 */
function copyToClipboard(text, buttonElement) {
    const originalHTML = buttonElement.innerHTML;
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(buttonElement, originalHTML);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text.');
    });
}

/**
 * Copies the referral code and gives feedback.
 * @param {HTMLElement} boxElement - The `.referral-code-box` element.
 */
function copyReferralCode(boxElement) {
    const code = document.getElementById('referral-code').textContent;
    const feedbackEl = boxElement.querySelector('.copy-feedback');
    const originalHTML = feedbackEl.innerHTML;
    
    navigator.clipboard.writeText(code).then(() => {
        feedbackEl.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => {
            feedbackEl.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code: ', err);
        alert('Failed to copy code.');
    });
}

/**
 * Copies the referral link and gives feedback on the button.
 * @param {HTMLElement} buttonElement - The copy link button.
 */
function copyReferralLink(buttonElement) {
    const link = document.getElementById('referral-link-text').textContent;
    const originalHTML = buttonElement.innerHTML;
    navigator.clipboard.writeText(link).then(() => {
        showCopyFeedback(buttonElement, originalHTML);
    }).catch(err => {
        console.error('Failed to copy link: ', err);
    });
}

/**
 * Simulates sharing on social media by opening a new window.
 * @param {'facebook'|'twitter'|'whatsapp'|'telegram'} platform - The social platform.
 */
function shareOnSocial(platform) {
    const referralLink = encodeURIComponent(document.getElementById('referral-link-text').textContent);
    const text = encodeURIComponent("Join me on Aegis Finance and start investing today!");
    let url = '';

    switch (platform) {
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${referralLink}`;
            break;
        case 'twitter':
            url = `https://twitter.com/intent/tweet?url=${referralLink}&text=${text}`;
            break;
        case 'whatsapp':
            url = `https://api.whatsapp.com/send?text=${text}%20${referralLink}`;
            break;
        case 'telegram':
            url = `https://t.me/share/url?url=${referralLink}&text=${text}`;
            break;
    }

    if (url) {
        window.open(url, '_blank', 'width=600,height=400');
    }
}
