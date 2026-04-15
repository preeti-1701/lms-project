/* ════════════════════════════════════════════════════════════
   EduVerse LMS – app.js  (pure vanilla JS, no dependencies)
   ════════════════════════════════════════════════════════════ */

/* ── State ── */
let currentRole = 'student';  // student | teacher | admin
let teacherStep = 1;
let otpTimer = null;

/* ── DOM Selectors ── */
const body = document.body;
const tabBtns = document.querySelectorAll('.role-tab');
const tabIndicator = document.getElementById('tabIndicator');
const rolePanels = document.querySelectorAll('.role-panel');
const illus = document.querySelectorAll('.illus');
const brandPanel = document.getElementById('brandPanel');
const forgotModal = document.getElementById('forgotModal');
const modalClose = document.getElementById('modalClose');
const toast = document.getElementById('toast');

/* ════════════════════════════════════════════════════════════
   1. ROLE TAB SWITCHING
   ════════════════════════════════════════════════════════════ */

function moveIndicator(tab) {
    const rect = tab.getBoundingClientRect();
    const parentRect = tab.parentElement.getBoundingClientRect();
    tabIndicator.style.left = (rect.left - parentRect.left) + 'px';
    tabIndicator.style.width = rect.width + 'px';
}

function switchRole(role) {
    currentRole = role;
    body.setAttribute('data-role', role);

    // Update tabs
    tabBtns.forEach(btn => {
        const isActive = btn.dataset.role === role;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
        if (isActive) moveIndicator(btn);
    });

    // Update panels (with animation reset trick)
    rolePanels.forEach(panel => {
        const isActive = panel.id === `panel${capitalize(role)}`;
        panel.classList.remove('active');
        if (isActive) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => panel.classList.add('active'));
            });
        }
    });

    // Update illustrations
    illus.forEach(il => {
        const isActive = il.id === `ill${capitalize(role)}`;
        il.classList.toggle('active', isActive);
        if (!isActive) il.style.position = 'absolute';
        else il.style.position = 'relative';
    });

    // Refresh captcha if admin
    if (role === 'admin') generateCaptcha();

    // Sync CSS tab-indicator colour via role vars (already set in CSS)
    tabIndicator.style.background = getComputedStyle(body)
        .getPropertyValue('--role-primary').trim() || '#3B82F6';
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchRole(btn.dataset.role));
});

/* ════════════════════════════════════════════════════════════
   2. FORM VIEW TOGGLE (login ↔ register)  – globally accessible
   ════════════════════════════════════════════════════════════ */

window.switchView = function (viewId) {
    const currentPanel = document.getElementById(`panel${capitalize(currentRole)}`);
    const views = currentPanel.querySelectorAll('.form-view');
    views.forEach(v => {
        v.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
};

/* ════════════════════════════════════════════════════════════
   3. SHOW / HIDE PASSWORD TOGGLES
   ════════════════════════════════════════════════════════════ */

document.addEventListener('click', e => {
    const btn = e.target.closest('.toggle-pw');
    if (!btn) return;
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('.eye-open').classList.toggle('hidden', isHidden);
    btn.querySelector('.eye-closed').classList.toggle('hidden', !isHidden);
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
});

/* ════════════════════════════════════════════════════════════
   4. INLINE VALIDATION HELPERS
   ════════════════════════════════════════════════════════════ */

function setError(inputOrId, errId, msg) {
    const input = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
    const errEl = document.getElementById(errId);
    if (!input || !errEl) return;
    if (msg) {
        input.classList.add('invalid'); input.classList.remove('valid');
        errEl.textContent = msg;
    } else {
        input.classList.remove('invalid'); input.classList.add('valid');
        errEl.textContent = '';
    }
    return !msg;
}

function clearErrors(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.classList.remove('invalid', 'valid'); }
    });
}

function validateEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }
function validatePhone(val) { return /^[6-9]\d{9}$/.test(val.replace(/[\s\+\-]/g, '')); }
function validateEmailOrPhone(val) { return validateEmail(val) || validatePhone(val); }
function validatePassword(val) { return val.length >= 8; }

/* Real-time validation on blur */
function attachBlurValidation(inputId, errId, validatorFn, errMsg) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('blur', () => {
        if (!el.value.trim()) { setError(inputId, errId, 'This field is required.'); return; }
        if (!validatorFn(el.value.trim())) setError(inputId, errId, errMsg);
        else setError(inputId, errId, '');
    });
    el.addEventListener('input', () => {
        if (el.classList.contains('invalid') && validatorFn(el.value.trim()))
            setError(inputId, errId, '');
    });
}

/* Password strength meter */
function attachStrengthMeter(inputId, fillId, labelId) {
    const input = document.getElementById(inputId);
    const fill = document.getElementById(fillId);
    const label = document.getElementById(labelId);
    if (!input || !fill || !label) return;

    input.addEventListener('input', () => {
        const val = input.value;
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = [
            { pct: '0%', color: '#E2E8F0', text: 'Password strength' },
            { pct: '25%', color: '#EF4444', text: 'Weak' },
            { pct: '50%', color: '#F59E0B', text: 'Fair' },
            { pct: '75%', color: '#3B82F6', text: 'Good' },
            { pct: '100%', color: '#10B981', text: 'Strong 💪' },
        ];
        const lvl = val.length ? levels[score] : levels[0];
        fill.style.width = lvl.pct;
        fill.style.background = lvl.color;
        label.textContent = val.length ? lvl.text : 'Password strength';
        label.style.color = lvl.color;
    });
}

/* ════════════════════════════════════════════════════════════
   5. STUDENT FORMS
   ════════════════════════════════════════════════════════════ */

// Attach validations
attachBlurValidation('sLoginEmail', 'sLoginEmailErr', validateEmailOrPhone, 'Enter a valid email or 10-digit mobile number.');
attachBlurValidation('sLoginPassword', 'sLoginPasswordErr', v => v.length >= 6, 'Password must be at least 6 characters.');
attachBlurValidation('sRegName', 'sRegNameErr', v => v.length >= 2, 'Please enter your full name.');
attachBlurValidation('sRegMobile', 'sRegMobileErr', validatePhone, 'Enter a valid 10-digit mobile number.');
attachBlurValidation('sRegEmail', 'sRegEmailErr', validateEmail, 'Enter a valid email address.');
attachBlurValidation('sRegPassword', 'sRegPasswordErr', validatePassword, 'Password must be at least 8 characters.');
attachStrengthMeter('sRegPassword', 'sRegPwFill', 'sRegPwLabel');

// Interest tag toggle
document.querySelectorAll('#interestTags .tag').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('selected'));
});

// Student Login submit
document.getElementById('formStudentLogin').addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ok &= setError('sLoginEmail', 'sLoginEmailErr',
        !document.getElementById('sLoginEmail').value.trim() ? 'This field is required.' :
            !validateEmailOrPhone(document.getElementById('sLoginEmail').value) ? 'Enter a valid email or mobile.' : '');
    ok &= setError('sLoginPassword', 'sLoginPasswordErr',
        !document.getElementById('sLoginPassword').value ? 'This field is required.' : '');
    if (!ok) return;
    simulateSubmit('btnStudentLogin', () => {
        const email = document.getElementById('sLoginEmail').value.trim();
        const session = { userId:'u4', role:'student', name:'Alice Johnson', email, token:'tok_'+Date.now(), loginTime: new Date().toISOString() };
        localStorage.setItem('lms_session', JSON.stringify(session));
        showToast('Welcome back! Redirecting to dashboard… 🎉', 'success');
        setTimeout(() => window.location.href = 'student-dashboard.html', 1400);
    });
});

// Student Register submit
document.getElementById('formStudentRegister').addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ok &= setError('sRegName', 'sRegNameErr', !document.getElementById('sRegName').value.trim() ? 'Required.' : document.getElementById('sRegName').value.length < 2 ? 'Enter your full name.' : '');
    ok &= setError('sRegMobile', 'sRegMobileErr', !validatePhone(document.getElementById('sRegMobile').value) ? 'Enter valid 10-digit mobile.' : '');
    ok &= setError('sRegEmail', 'sRegEmailErr', !validateEmail(document.getElementById('sRegEmail').value) ? 'Enter a valid email.' : '');
    ok &= setError('sRegPassword', 'sRegPasswordErr', !validatePassword(document.getElementById('sRegPassword').value) ? 'Minimum 8 characters.' : '');
    if (!ok) return;
    simulateSubmit('btnStudentRegister', () => showToast('Account created! Check your email to verify. 🎓', 'success'));
});

/* ════════════════════════════════════════════════════════════
   6. TEACHER LOGIN + OTP
   ════════════════════════════════════════════════════════════ */

attachBlurValidation('tLoginEmail', 'tLoginEmailErr', validateEmail, 'Enter a valid email address.');
attachBlurValidation('tLoginPassword', 'tLoginPasswordErr', v => v.length >= 6, 'Password must be at least 6 characters.');

let otpShown = false;

document.getElementById('formTeacherLogin').addEventListener('submit', e => {
    e.preventDefault();

    if (!otpShown) {
        // First submit: validate email/pass, then show OTP
        let ok = true;
        ok &= setError('tLoginEmail', 'tLoginEmailErr', !validateEmail(document.getElementById('tLoginEmail').value) ? 'Enter a valid email.' : '');
        ok &= setError('tLoginPassword', 'tLoginPasswordErr', !document.getElementById('tLoginPassword').value ? 'Required.' : '');
        if (!ok) return;

        const btn = document.getElementById('btnTeacherLogin');
        const btnText = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.btn-spinner');
        btn.disabled = true;
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');

        setTimeout(() => {
            btn.disabled = false;
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            btnText.textContent = 'Verify & Sign In';

            const otpSec = document.getElementById('otpSection');
            otpSec.style.display = 'block';
            otpSec.style.opacity = '0';
            otpSec.style.transform = 'translateY(10px)';
            requestAnimationFrame(() => {
                otpSec.style.transition = 'opacity 0.4s, transform 0.4s';
                otpSec.style.opacity = '1';
                otpSec.style.transform = 'translateY(0)';
            });
            otpShown = true;
            startOTPTimer();
            document.querySelector('.otp-digit').focus();
        }, 1800);
    } else {
        // Second submit: verify OTP
        const digits = [...document.querySelectorAll('.otp-digit')].map(d => d.value.trim());
        if (digits.some(d => !d) || digits.join('').length < 6) {
            showToast('Please enter all 6 OTP digits.', 'error'); return;
        }
        simulateSubmit('btnTeacherLogin', () => {
            const email = document.getElementById('tLoginEmail').value.trim();
            const session = { userId:'u2', role:'trainer', name:'Dr. Sarah Chen', email, token:'tok_'+Date.now(), loginTime: new Date().toISOString() };
            localStorage.setItem('lms_session', JSON.stringify(session));
            showToast('Welcome, Professor! Redirecting… 🏫', 'success');
            setTimeout(() => window.location.href = 'trainer-dashboard.html', 1400);
        });
    }
});

function startOTPTimer(seconds = 30) {
    clearInterval(otpTimer);
    document.getElementById('otpTimer').classList.remove('hidden');
    document.getElementById('otpResend').classList.add('hidden');
    let t = seconds;
    document.getElementById('otpCountdown').textContent = t;
    otpTimer = setInterval(() => {
        t--;
        document.getElementById('otpCountdown').textContent = t;
        if (t <= 0) {
            clearInterval(otpTimer);
            document.getElementById('otpTimer').classList.add('hidden');
            document.getElementById('otpResend').classList.remove('hidden');
        }
    }, 1000);
}

document.getElementById('otpResend').addEventListener('click', () => {
    showToast('OTP resent to your email!', 'success');
    startOTPTimer();
    document.querySelectorAll('.otp-digit').forEach(d => d.value = '');
    document.querySelector('.otp-digit').focus();
});

// OTP digit auto-advance
document.querySelectorAll('.otp-digit').forEach((el, idx, arr) => {
    el.addEventListener('input', () => {
        el.value = el.value.replace(/\D/g, '');
        if (el.value && idx < arr.length - 1) arr[idx + 1].focus();
    });
    el.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !el.value && idx > 0) arr[idx - 1].focus();
    });
    el.addEventListener('paste', e => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        arr.forEach((d, i) => { d.value = pasted[i] || ''; });
        const nextEmpty = [...arr].findIndex(d => !d.value);
        arr[nextEmpty >= 0 ? nextEmpty : arr.length - 1].focus();
    });
});

/* ════════════════════════════════════════════════════════════
   7. TEACHER MULTI-STEP REGISTRATION
   ════════════════════════════════════════════════════════════ */

attachBlurValidation('tRegFName', 'tRegFNameErr', v => v.length >= 2, 'Enter at least 2 characters.');
attachBlurValidation('tRegEmail', 'tRegEmailErr', validateEmail, 'Enter a valid email.');
attachBlurValidation('tRegPhone', 'tRegPhoneErr', validatePhone, 'Enter a valid 10-digit number.');
attachBlurValidation('tRegSubject', 'tRegSubjectErr', v => v.length >= 2, 'Enter your subject area.');
attachStrengthMeter('tRegPw', 'tRegPwFill', 'tRegPwLabel');

let tCurrentStep = 1;
const T_TOTAL = 4;

window.teacherStep = function (dir) {
    if (!validateTeacherStep(tCurrentStep)) return;

    const newStep = tCurrentStep + dir;
    if (newStep < 1 || newStep > T_TOTAL) return;

    // Mark old step done/active
    const oldDot = document.querySelector(`.step-dot[data-step="${tCurrentStep}"]`);
    if (dir > 0) { oldDot.classList.remove('active'); oldDot.classList.add('done'); }
    else { oldDot.classList.remove('done', 'active'); }

    document.getElementById(`tStep${tCurrentStep}`).classList.remove('active');
    tCurrentStep = newStep;
    document.getElementById(`tStep${tCurrentStep}`).classList.add('active');

    const dot = document.querySelector(`.step-dot[data-step="${tCurrentStep}"]`);
    dot.classList.remove('done');
    dot.classList.add('active');

    // Update fill bar
    const pct = ((tCurrentStep - 1) / (T_TOTAL - 1)) * 100;
    document.getElementById('tRegStepFill').style.width = pct + '%';

    // Step label
    const labels = ['Personal Details', 'Qualification & Expertise', 'Document Upload', 'Account Setup'];
    document.getElementById('tRegStepLabel').textContent =
        `Step ${tCurrentStep} of ${T_TOTAL} – ${labels[tCurrentStep - 1]}`;

    // Back button
    document.getElementById('tRegBack').style.display = tCurrentStep > 1 ? 'block' : 'none';

    // Next button text
    const nextBtn = document.getElementById('tRegNext');
    if (tCurrentStep === T_TOTAL) {
        nextBtn.querySelector('.btn-text').textContent = '🚀 Submit Application';
        nextBtn.onclick = null;
        nextBtn.type = 'submit';
        nextBtn.form = 'formTeacherRegister';
    } else {
        nextBtn.querySelector('.btn-text').textContent = 'Next Step →';
        nextBtn.type = 'button';
        nextBtn.onclick = () => teacherStep(1);
    }
};

function validateTeacherStep(step) {
    switch (step) {
        case 1:
            let ok1 = true;
            ok1 &= setError('tRegFName', 'tRegFNameErr', !document.getElementById('tRegFName').value.trim() ? 'Required.' : document.getElementById('tRegFName').value.length < 2 ? 'Min 2 characters.' : '');
            ok1 &= setError('tRegEmail', 'tRegEmailErr', !validateEmail(document.getElementById('tRegEmail').value) ? 'Enter a valid email.' : '');
            ok1 &= setError('tRegPhone', 'tRegPhoneErr', !validatePhone(document.getElementById('tRegPhone').value) ? 'Enter valid 10-digit number.' : '');
            return !!ok1;
        case 2:
            let ok2 = true;
            ok2 &= setError('tRegQual', 'tRegQualErr', !document.getElementById('tRegQual').value ? 'Please select your qualification.' : '');
            ok2 &= setError('tRegSubject', 'tRegSubjectErr', !document.getElementById('tRegSubject').value.trim() ? 'Enter your area of expertise.' : '');
            ok2 &= setError('tRegExp', 'tRegExpErr', !document.getElementById('tRegExp').value ? 'Please select experience.' : '');
            return !!ok2;
        case 3:
            return true; // docs optional at UI level
        case 4:
            return true;
        default: return true;
    }
}

document.getElementById('formTeacherRegister').addEventListener('submit', e => {
    e.preventDefault();
    if (tCurrentStep !== 4) return;
    const pw = document.getElementById('tRegPw').value;
    const cpw = document.getElementById('tRegPwConfirm').value;
    let ok = true;
    ok &= setError('tRegPw', 'tRegPwErr', !validatePassword(pw) ? 'Minimum 8 characters.' : '');
    ok &= setError('tRegPwConfirm', 'tRegPwConfirmErr', pw !== cpw ? 'Passwords do not match.' : '');
    if (!document.getElementById('tRegTerms').checked) {
        showToast('Please accept the Terms & Privacy Policy.', 'error'); return;
    }
    if (!ok) return;
    simulateSubmit('tRegNext', () => showToast('Application submitted! We'));
});

// File upload display filenames
['fileCert', 'fileId'].forEach(id => {
    const input = document.getElementById(id);
    const nameEl = document.getElementById(id === 'fileCert' ? 'certName' : 'idName');
    input.addEventListener('change', () => {
        nameEl.textContent = input.files[0]?.name || 'No file chosen';
    });
});

/* ════════════════════════════════════════════════════════════
   8. ADMIN LOGIN + CAPTCHA
   ════════════════════════════════════════════════════════════ */

attachBlurValidation('aLoginId', 'aLoginIdErr', v => v.length >= 3, 'Enter a valid Admin ID.');
attachBlurValidation('aLoginPassword', 'aLoginPasswordErr', v => v.length >= 6, 'Password must be at least 6 characters.');

let captchaValue = '';

function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    captchaValue = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    document.getElementById('captchaText').textContent = captchaValue;
}

document.getElementById('captchaRefresh').addEventListener('click', () => {
    generateCaptcha();
    document.getElementById('aCaptchaInput').value = '';
    document.getElementById('aCaptchaErr').textContent = '';
});

document.getElementById('formAdminLogin').addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ok &= setError('aLoginId', 'aLoginIdErr', !document.getElementById('aLoginId').value.trim() ? 'Required.' : '');
    ok &= setError('aLoginPassword', 'aLoginPasswordErr', !document.getElementById('aLoginPassword').value ? 'Required.' : '');
    const captchaInput = document.getElementById('aCaptchaInput').value.toUpperCase().trim();
    const captchaErr = document.getElementById('aCaptchaErr');
    if (captchaInput !== captchaValue) {
        captchaErr.textContent = 'Incorrect security code. Please try again.';
        generateCaptcha();
        document.getElementById('aCaptchaInput').value = '';
        ok = false;
    } else {
        captchaErr.textContent = '';
    }
    if (!ok) return;
    simulateSubmit('btnAdminLogin', () => {
        const session = { userId:'u1', role:'admin', name:'System Admin', email:'admin@eduverse.com', token:'tok_'+Date.now(), loginTime: new Date().toISOString() };
        localStorage.setItem('lms_session', JSON.stringify(session));
        showToast('Secure access granted. Redirecting… 🔒', 'success');
        setTimeout(() => window.location.href = 'admin-dashboard.html', 1400);
    });
});

/* ════════════════════════════════════════════════════════════
   9. FORGOT PASSWORD MODAL
   ════════════════════════════════════════════════════════════ */

document.querySelectorAll('.forgot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('forgotSuccess').classList.add('hidden');
        document.getElementById('forgotForm').style.display = '';
        document.getElementById('forgotEmail').value = '';
        document.getElementById('forgotEmailErr').textContent = '';
        forgotModal.classList.add('open');
        setTimeout(() => document.getElementById('forgotEmail').focus(), 200);
    });
});

modalClose.addEventListener('click', () => forgotModal.classList.remove('open'));
forgotModal.addEventListener('click', e => { if (e.target === forgotModal) forgotModal.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') forgotModal.classList.remove('open'); });

attachBlurValidation('forgotEmail', 'forgotEmailErr', validateEmail, 'Enter a valid email.');

document.getElementById('forgotForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!validateEmail(document.getElementById('forgotEmail').value)) {
        setError('forgotEmail', 'forgotEmailErr', 'Enter a valid email.'); return;
    }
    simulateSubmit('btnForgot', () => {
        document.getElementById('forgotForm').style.display = 'none';
        document.getElementById('forgotSuccess').classList.remove('hidden');
    });
});

/* ════════════════════════════════════════════════════════════
   10. UTILITIES
   ════════════════════════════════════════════════════════════ */

function simulateSubmit(btnId, onSuccess, delay = 2000) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    btn.disabled = true;
    if (text) text.classList.add('hidden');
    if (spinner) spinner.classList.remove('hidden');
    setTimeout(() => {
        btn.disabled = false;
        if (text) text.classList.remove('hidden');
        if (spinner) spinner.classList.add('hidden');
        onSuccess && onSuccess();
    }, delay);
}

let toastTimer = null;
function showToast(msg, type = '') {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = 'toast' + (type ? ` ${type}` : '');
    requestAnimationFrame(() => toast.classList.add('show'));
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ════════════════════════════════════════════════════════════
   11. INIT
   ════════════════════════════════════════════════════════════ */

(function init() {
    // Set initial role
    switchRole('student');

    // Generate captcha for admin (even before tab is clicked)
    generateCaptcha();

    // Move indicator after fonts/layout settle
    requestAnimationFrame(() => {
        const activeTab = document.querySelector('.role-tab.active');
        if (activeTab) moveIndicator(activeTab);
    });

    // Re-position indicator on resize
    window.addEventListener('resize', () => {
        const activeTab = document.querySelector('.role-tab.active');
        if (activeTab) moveIndicator(activeTab);
    });

    // Smooth in brand illustration
    const activeIllusEl = document.querySelector('.illus.active');
    if (activeIllusEl) activeIllusEl.style.position = 'relative';

    console.log('%c EduVerse LMS Auth  🎓 ', 'background:#3B82F6;color:#fff;font-size:14px;padding:4px 8px;border-radius:4px;');
})();
