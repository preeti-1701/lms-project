import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

// ── Shared SVGs ──────────────────────────────────────────────
const IconEmail = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,12 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconUser = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconPhone = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);
const IconShield = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

// ── Password field with toggle ───────────────────────────────
function PwField({ id, placeholder, value, onChange, label }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <IconLock />
        <input
          type={show ? 'text' : 'password'}
          id={id} placeholder={placeholder}
          value={value} onChange={e => onChange(e.target.value)}
          autoComplete="new-password"
        />
        <button type="button" className="toggle-pw" onClick={() => setShow(s => !s)} aria-label="Toggle password">
          {show
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          }
        </button>
      </div>
    </div>
  );
}

// ── Password strength ────────────────────────────────────────
function PwStrength({ pw }) {
  const getStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const score = getStrength(pw);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  if (!pw) return null;
  return (
    <div className="pw-strength">
      <div className="pw-bar">
        <div className="pw-fill" style={{ width: `${score * 25}%`, background: colors[score] }} />
      </div>
      <span className="pw-label" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

// ── Generate CAPTCHA string ──────────────────────────────────
const genCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ══════════════════════════════════════════════════════════════
// STUDENT PANEL
// ══════════════════════════════════════════════════════════════
function StudentPanel({ onLogin }) {
  const { login, registerStudent, showToast } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  // login
  const [lEmail, setLEmail] = useState('');
  const [lPw, setLPw] = useState('');
  const [lRemember, setLRemember] = useState(false);
  // register
  const [rName, setRName] = useState('');
  const [rMobile, setRMobile] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPw, setRPw] = useState('');
  const [rInterests, setRInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const INTERESTS = [{ val:'web', label:'💻 Web Dev' },{ val:'data', label:'📊 Data Science' },{ val:'design', label:'🎨 Design' },{ val:'ai', label:'🤖 AI / ML' },{ val:'business', label:'💼 Business' },{ val:'lang', label:'🗣 Languages' }];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!lEmail || !lPw) return showToast('Please fill all fields.', 'error');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const res = await login(lEmail, lPw, 'student');
    setLoading(false);
    if (res.ok) { showToast(`Welcome back, ${res.user.name}! 🎉`, 'success'); navigate('/student'); }
    else showToast(res.msg, 'error');
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!rName || !rEmail || !rMobile || !rPw) return showToast('Please fill all required fields.', 'error');
    if (rPw.length < 8) return showToast('Password must be at least 8 characters.', 'error');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const res = await registerStudent({ name: rName, email: rEmail, mobile: rMobile, password: rPw, interests: rInterests });
    setLoading(false);
    if (res.ok) setView('login');
    else showToast(res.msg, 'error');
  };
  const toggleInterest = (val) => setRInterests(i => i.includes(val) ? i.filter(x => x !== val) : [...i, val]);

  if (view === 'login') return (
    <div className="form-view active">
      <div className="form-header"><h2>Welcome Back! 👋</h2><p>Sign in to continue your learning journey</p></div>
      <form onSubmit={handleLogin} noValidate>
        <div className="field-group">
          <label htmlFor="sLoginEmail">Email or Mobile Number</label>
          <div className="input-wrap"><IconEmail /><input type="text" id="sLoginEmail" placeholder="email@example.com or 9876543210" value={lEmail} onChange={e => setLEmail(e.target.value)} /></div>
        </div>
        <PwField id="sLoginPw" label="Password" placeholder="Enter your password" value={lPw} onChange={setLPw} />
        <div className="form-row">
          <label className="checkbox-label">
            <input type="checkbox" checked={lRemember} onChange={e => setLRemember(e.target.checked)} />
            <span className="checkmark"></span> Remember me
          </label>
          <button type="button" className="link-btn forgot-btn" onClick={() => onLogin('forgot')}>Forgot Password?</button>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <><span className="btn-spinner"/>&nbsp;Signing In…</> : <span>Sign In</span>}
        </button>
        <div className="divider"><span>or continue with</span></div>
        <button type="button" className="btn-google" onClick={() => showToast('Google sign-in coming soon!', 'info')}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </form>
      <p className="form-switch">Don't have an account? <button className="link-btn" onClick={() => setView('register')}>Sign up free</button></p>
    </div>
  );

  return (
    <div className="form-view active">
      <div className="form-header"><h2>Create Account 🎓</h2><p>Join thousands of learners today</p></div>
      <form onSubmit={handleRegister} noValidate>
        <div className="form-row-2">
          <div className="field-group"><label htmlFor="sRegName">Full Name</label><div className="input-wrap"><IconUser /><input type="text" id="sRegName" placeholder="John Doe" value={rName} onChange={e => setRName(e.target.value)} /></div></div>
          <div className="field-group"><label htmlFor="sRegMobile">Mobile Number</label><div className="input-wrap"><IconPhone /><input type="tel" id="sRegMobile" placeholder="+91 98765 43210" value={rMobile} onChange={e => setRMobile(e.target.value)} /></div></div>
        </div>
        <div className="field-group"><label htmlFor="sRegEmail">Email Address</label><div className="input-wrap"><IconEmail /><input type="email" id="sRegEmail" placeholder="john@example.com" value={rEmail} onChange={e => setREmail(e.target.value)} /></div></div>
        <div className="field-group">
          <label htmlFor="sRegPw">Password</label>
          <div className="input-wrap">
            <IconLock />
            <input type="password" id="sRegPw" placeholder="Min. 8 characters" value={rPw} onChange={e => setRPw(e.target.value)} />
          </div>
          <PwStrength pw={rPw} />
        </div>
        <div className="field-group">
          <label>Interests (Optional)</label>
          <div className="interest-tags">
            {INTERESTS.map(t => (
              <button key={t.val} type="button" className={`tag ${rInterests.includes(t.val) ? 'selected' : ''}`} onClick={() => toggleInterest(t.val)}>{t.label}</button>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <><span className="btn-spinner"/>&nbsp;Creating…</> : 'Create My Account'}
        </button>
      </form>
      <p className="form-switch">Already have an account? <button className="link-btn" onClick={() => setView('login')}>Sign in</button></p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TEACHER PANEL
// ══════════════════════════════════════════════════════════════
function TeacherPanel({ onLogin }) {
  const { login, registerTeacher, showToast } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  const [lEmail, setLEmail] = useState('');
  const [lPw, setLPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  // register fields
  const [fName, setFName] = useState(''); const [lName, setLName] = useState('');
  const [tEmail, setTEmail] = useState(''); const [tPhone, setTPhone] = useState('');
  const [qual, setQual] = useState(''); const [subject, setSubject] = useState('');
  const [exp, setExp] = useState(''); const [bio, setBio] = useState('');
  const [certFile, setCertFile] = useState(null); const [idFile, setIdFile] = useState(null);
  const [rPw, setRPw] = useState(''); const [rPwC, setRPwC] = useState('');
  const [terms, setTerms] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!lEmail || !lPw) return showToast('Please fill all fields.', 'error');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const res = await login(lEmail, lPw, 'trainer');
    setLoading(false);
    if (res.ok) { showToast(`Welcome, ${res.user.name}! 👨‍🏫`, 'success'); navigate('/trainer'); }
    else showToast(res.msg, 'error');
  };

  const nextStep = () => {
    if (step === 1 && (!fName || !lName || !tEmail || !tPhone)) return showToast('Please fill all personal details.', 'error');
    if (step === 2 && (!qual || !subject || !exp)) return showToast('Please fill expertise details.', 'error');
    if (step < 4) setStep(s => s + 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!rPw || rPw.length < 8) return showToast('Password must be at least 8 characters.', 'error');
    if (rPw !== rPwC) return showToast('Passwords do not match.', 'error');
    if (!terms) return showToast('Please accept Terms of Service.', 'error');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const res = await registerTeacher({
      name: `${fName} ${lName}`.trim(),
      email: tEmail,
      mobile: tPhone,
      qualification: qual,
      subject,
      experience: exp,
      bio,
      password: rPw,
    });
    setLoading(false);
    if (res.ok) setView('login');
    else showToast(res.msg, 'error');
  };

  const stepFill = `${((step - 1) / 3) * 100}%`;

  if (view === 'login') return (
    <div className="form-view active">
      <div className="form-header"><h2>Teacher Portal</h2><p>Secure sign-in for education professionals</p></div>
      <form onSubmit={handleLogin} noValidate>
        <div className="field-group"><label htmlFor="tLoginEmail">Institutional Email</label><div className="input-wrap"><IconEmail /><input type="email" id="tLoginEmail" placeholder="teacher@institution.edu" value={lEmail} onChange={e => setLEmail(e.target.value)} /></div></div>
        <PwField id="tLoginPw" label="Password" placeholder="Enter your password" value={lPw} onChange={setLPw} />
        <div className="form-row"><div></div><button type="button" className="link-btn forgot-btn" onClick={() => onLogin('forgot')}>Forgot Password?</button></div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <><span className="btn-spinner"/>&nbsp;Verifying…</> : 'Continue'}
        </button>
      </form>
      <p className="form-switch">New to EduVerse? <button className="link-btn" onClick={() => setView('register')}>Apply as Teacher</button></p>
    </div>
  );

  return (
    <div className="form-view active">
      <div className="form-header"><h2>Join as Teacher 🏫</h2><p>Share your expertise with learners worldwide</p></div>
      <div className="step-progress">
        <div className="step-track"><div className="step-fill" style={{ width: stepFill }} /></div>
        <div className="step-dots">
          {['Personal','Expertise','Documents','Account'].map((l, i) => (
            <div key={i} className={`step-dot ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <span>{step > i + 1 ? '✓' : i + 1}</span><label>{l}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="step-label-center">Step {step} of 4 – {['Personal Details','Expertise','Documents','Account'][step-1]}</div>
      <form onSubmit={handleRegister} noValidate>
        {step === 1 && (
          <div className="t-step active">
            <div className="form-row-2">
              <div className="field-group"><label>First Name</label><div className="input-wrap"><IconUser /><input type="text" placeholder="First name" value={fName} onChange={e => setFName(e.target.value)} /></div></div>
              <div className="field-group"><label>Last Name</label><div className="input-wrap"><input type="text" placeholder="Last name" value={lName} onChange={e => setLName(e.target.value)} style={{ paddingLeft: 14 }} /></div></div>
            </div>
            <div className="field-group"><label>Email Address</label><div className="input-wrap"><IconEmail /><input type="email" placeholder="your@email.com" value={tEmail} onChange={e => setTEmail(e.target.value)} /></div></div>
            <div className="field-group"><label>Phone Number</label><div className="input-wrap"><IconPhone /><input type="tel" placeholder="+91 98765 43210" value={tPhone} onChange={e => setTPhone(e.target.value)} /></div></div>
          </div>
        )}
        {step === 2 && (
          <div className="t-step active">
            <div className="field-group"><label>Highest Qualification</label><div className="input-wrap select-wrap"><select value={qual} onChange={e => setQual(e.target.value)} style={{ paddingLeft: 14 }}><option value="">Select qualification</option><option>Bachelor's Degree</option><option>Master's Degree</option><option>Ph.D</option><option>Professional Certification</option><option>Other</option></select></div></div>
            <div className="field-group"><label>Subject / Expertise Area</label><div className="input-wrap"><IconUser /><input type="text" placeholder="e.g. Mathematics, Python, Design" value={subject} onChange={e => setSubject(e.target.value)} /></div></div>
            <div className="field-group"><label>Years of Experience</label><div className="input-wrap select-wrap"><select value={exp} onChange={e => setExp(e.target.value)} style={{ paddingLeft: 14 }}><option value="">Select experience</option><option>0 – 1 year</option><option>1 – 3 years</option><option>3 – 5 years</option><option>5 – 10 years</option><option>10+ years</option></select></div></div>
            <div className="field-group"><label>Short Bio</label><textarea placeholder="Tell students a little about yourself..." value={bio} onChange={e => setBio(e.target.value)} rows={3} /></div>
          </div>
        )}
        {step === 3 && (
          <div className="t-step active">
            <div className="upload-area">
              <div className="upload-icon">📄</div>
              <p className="upload-title">Degree / Certificates</p>
              <p className="upload-hint">PDF, JPG, PNG – max 5MB</p>
              <input type="file" id="fileCert" accept=".pdf,.jpg,.jpeg,.png" style={{ display:'none' }} onChange={e => setCertFile(e.target.files[0])} />
              <button type="button" className="btn-outline" onClick={() => document.getElementById('fileCert').click()}>Choose File</button>
              <span className="upload-name">{certFile ? certFile.name : 'No file chosen'}</span>
            </div>
            <div className="upload-area">
              <div className="upload-icon">🪪</div>
              <p className="upload-title">Government ID Proof</p>
              <p className="upload-hint">Aadhaar, Passport, or Driving License</p>
              <input type="file" id="fileId" accept=".pdf,.jpg,.jpeg,.png" style={{ display:'none' }} onChange={e => setIdFile(e.target.files[0])} />
              <button type="button" className="btn-outline" onClick={() => document.getElementById('fileId').click()}>Choose File</button>
              <span className="upload-name">{idFile ? idFile.name : 'No file chosen'}</span>
            </div>
            <div className="info-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Documents are verified within 2–3 business days. You'll be notified via email.
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="t-step active">
            <PwField id="tRegPw" label="Create Password" placeholder="Min. 8 characters" value={rPw} onChange={setRPw} />
            <PwStrength pw={rPw} />
            <PwField id="tRegPwC" label="Confirm Password" placeholder="Re-enter your password" value={rPwC} onChange={setRPwC} />
            <label className="checkbox-label mt8">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
              <span className="checkmark"></span>
              I agree to the <a href="#" className="link-inline">Terms of Service</a> and <a href="#" className="link-inline">Privacy Policy</a>
            </label>
          </div>
        )}

        <div className="step-nav">
          {step > 1 && <button type="button" className="btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>}
          {step < 4
            ? <button type="button" className="btn-primary" style={{ width:'auto', padding:'12px 24px' }} onClick={nextStep}>Next Step →</button>
            : <button type="submit" className="btn-primary" style={{ width:'auto', padding:'12px 24px' }} disabled={loading}>
                {loading ? <><span className="btn-spinner"/>&nbsp;Submitting…</> : 'Submit Application'}
              </button>
          }
        </div>
      </form>
      <p className="form-switch">Already registered? <button className="link-btn" onClick={() => setView('login')}>Sign in</button></p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════════════════════
function AdminPanel({ onLogin }) {
  const { login, showToast } = useApp();
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState('');
  const [pw, setPw] = useState('');
  const [captchaVal, setCaptchaVal] = useState('');
  const [captcha, setCaptcha] = useState(genCaptcha);
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => { setCaptcha(genCaptcha()); setCaptchaVal(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminId || !pw) return showToast('Please fill all fields.', 'error');
    if (captchaVal.toUpperCase() !== captcha) return showToast('Incorrect security code.', 'error');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const res = await login(adminId, pw, 'admin');
    setLoading(false);
    if (res.ok) { showToast(`Welcome, ${res.user.name}! 🛡️`, 'success'); navigate('/admin'); }
    else showToast(res.msg, 'error');
  };

  return (
    <div className="form-view active">
      <div className="form-header">
        <div className="admin-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Secure Admin Access
        </div>
        <h2>Administrator Login</h2>
        <p>Restricted area – authorized personnel only</p>
      </div>
      <div className="security-strip">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Session secured · 256-bit SSL encryption
      </div>
      <form onSubmit={handleLogin} noValidate>
        <div className="field-group">
          <label htmlFor="aLoginId">Admin ID</label>
          <div className="input-wrap"><IconUser /><input type="text" id="aLoginId" placeholder="ADM-XXXXXXXX" value={adminId} onChange={e => setAdminId(e.target.value)} autoComplete="username" /></div>
        </div>
        <PwField id="aLoginPw" label="Password" placeholder="Enter your password" value={pw} onChange={setPw} />
        <div className="field-group">
          <label>Security Code</label>
          <div className="captcha-wrap">
            <div className="captcha-box"><span style={{ userSelect:'none' }}>{captcha}</span></div>
            <button type="button" className="captcha-refresh" onClick={refreshCaptcha} aria-label="Refresh CAPTCHA">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            </button>
            <div className="input-wrap captcha-input-wrap">
              <IconShield />
              <input type="text" placeholder="Enter code above" maxLength={6} value={captchaVal} onChange={e => setCaptchaVal(e.target.value)} autoComplete="off" />
            </div>
          </div>
        </div>
        <div className="form-row"><div></div><button type="button" className="link-btn forgot-btn" onClick={() => onLogin('forgot')}>Forgot Password?</button></div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <><span className="btn-spinner"/>&nbsp;Authenticating…</>
            : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>&nbsp;Secure Sign In</>
          }
        </button>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FORGOT MODAL
// ══════════════════════════════════════════════════════════════
function ForgotModal({ open, onClose }) {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return showToast('Please enter your email.', 'error');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const handleClose = () => { onClose(); setSubmitted(false); setEmail(''); };

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`}>
      <div className="modal-card">
        <button className="modal-close" onClick={handleClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="modal-icon">🔑</div>
        <h3>Reset Your Password</h3>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        {submitted ? (
          <div className="modal-success">
            <div className="success-icon">✅</div>
            <p>Reset link sent! Check your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field-group" style={{ textAlign:'left' }}>
              <label htmlFor="forgotEmail">Email Address</label>
              <div className="input-wrap"><IconEmail /><input type="email" id="forgotEmail" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="btn-spinner"/>&nbsp;Sending…</> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ILLUSTRATIONS
// ══════════════════════════════════════════════════════════════
const IllStudent = ({ active }) => (
  <svg className={`illus ${active ? 'active' : ''}`} viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="60" width="260" height="170" rx="16" fill="white" fillOpacity="0.08"/>
    <rect x="60" y="80" width="140" height="12" rx="6" fill="white" fillOpacity="0.4"/>
    <rect x="60" y="102" width="100" height="8" rx="4" fill="white" fillOpacity="0.25"/>
    <rect x="60" y="122" width="220" height="60" rx="10" fill="white" fillOpacity="0.1"/>
    <circle cx="85" cy="152" r="20" fill="white" fillOpacity="0.15"/>
    <path d="M80 152 L85 157 L92 148" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="115" y="144" width="100" height="8" rx="4" fill="white" fillOpacity="0.3"/>
    <rect x="115" y="158" width="70" height="6" rx="3" fill="white" fillOpacity="0.2"/>
    <circle cx="285" cy="110" r="30" fill="white" fillOpacity="0.12"/>
    <path d="M275 110 L280 90 L285 110 L295 100 L285 115 L280 130 L275 110 Z" fill="white" fillOpacity="0.6"/>
  </svg>
);
const IllTeacher = ({ active }) => (
  <svg className={`illus ${active ? 'active' : ''}`} viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="40" width="280" height="190" rx="16" fill="white" fillOpacity="0.07"/>
    <rect x="30" y="40" width="280" height="40" rx="16" fill="white" fillOpacity="0.1"/>
    <circle cx="60" cy="60" r="8" fill="#EF4444" fillOpacity="0.7"/>
    <circle cx="82" cy="60" r="8" fill="#F59E0B" fillOpacity="0.7"/>
    <circle cx="104" cy="60" r="8" fill="#10B981" fillOpacity="0.7"/>
    <rect x="50" y="100" width="100" height="100" rx="8" fill="white" fillOpacity="0.1"/>
    <rect x="60" y="110" width="80" height="6" rx="3" fill="white" fillOpacity="0.4"/>
    <rect x="60" y="124" width="60" height="5" rx="2.5" fill="white" fillOpacity="0.25"/>
    <rect x="60" y="170" width="80" height="20" rx="6" fill="white" fillOpacity="0.2"/>
    <rect x="170" y="100" width="120" height="44" rx="8" fill="white" fillOpacity="0.1"/>
    <rect x="182" y="112" width="60" height="6" rx="3" fill="white" fillOpacity="0.4"/>
    <rect x="170" y="155" width="120" height="44" rx="8" fill="white" fillOpacity="0.1"/>
    <rect x="182" y="167" width="50" height="6" rx="3" fill="white" fillOpacity="0.4"/>
  </svg>
);
const IllAdmin = ({ active }) => (
  <svg className={`illus ${active ? 'active' : ''}`} viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="30" width="300" height="200" rx="16" fill="white" fillOpacity="0.06"/>
    <rect x="20" y="30" width="80" height="200" rx="16" fill="white" fillOpacity="0.06"/>
    <circle cx="60" cy="80" r="20" fill="white" fillOpacity="0.12"/>
    <path d="M52 80 L58 75 L68 86" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <rect x="120" y="50" width="180" height="80" rx="10" fill="white" fillOpacity="0.08"/>
    <rect x="135" y="65" width="70" height="8" rx="4" fill="white" fillOpacity="0.4"/>
    <rect x="120" y="150" width="80" height="60" rx="10" fill="white" fillOpacity="0.08"/>
    <rect x="220" y="150" width="80" height="60" rx="10" fill="white" fillOpacity="0.08"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════
// MAIN AUTH PAGE
// ══════════════════════════════════════════════════════════════
const ROLES = [
  { key:'student', label:'Student', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { key:'teacher', label:'Teacher', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { key:'admin', label:'Admin', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
];

export default function AuthPage() {
  const [role, setRole] = useState('student');
  const [forgotOpen, setForgotOpen] = useState(false);
  const tabRef = useRef(null);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const tabs = tabRef.current?.querySelectorAll('.role-tab');
    const activeIdx = ROLES.findIndex(r => r.key === role);
    if (tabs && indicatorRef.current) {
      const tab = tabs[activeIdx];
      if (tab) {
        indicatorRef.current.style.width = tab.offsetWidth + 'px';
        indicatorRef.current.style.left = tab.offsetLeft + 'px';
      }
    }
  }, [role]);

  return (
    <div className="auth-root">
      <div className="bg-blobs" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="page-wrapper">
        {/* Brand Panel */}
        <aside className="brand-panel">
          <div className="brand-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-label="EduVerse logo">
              <rect width="40" height="40" rx="12" fill="white" fillOpacity="0.15"/>
              <path d="M8 14l12-6 12 6v12l-12 6-12-6V14z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M8 14l12 6 12-6M20 20v12" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="brand-name">EduVerse</span>
          </div>
          <div className="brand-content">
            <h1 className="brand-headline">Empower Your<br/><span className="highlight">Learning Journey</span></h1>
            <p className="brand-subtext">A unified platform for students, educators, and administrators to collaborate, grow, and succeed.</p>
            <div className="brand-stats">
              <div className="stat-item"><span className="stat-num">50K+</span><span className="stat-label">Students</span></div>
              <div className="stat-item"><span className="stat-num">2K+</span><span className="stat-label">Courses</span></div>
              <div className="stat-item"><span className="stat-num">98%</span><span className="stat-label">Satisfaction</span></div>
            </div>
            <div className="brand-illustration">
              <IllStudent active={role === 'student'} />
              <IllTeacher active={role === 'teacher'} />
              <IllAdmin active={role === 'admin'} />
            </div>
          </div>
        </aside>

        {/* Auth Panel */}
        <main className="auth-panel">
          <div className="auth-card">
            {/* Role Tabs */}
            <div className="role-tabs" role="tablist" ref={tabRef}>
              {ROLES.map(r => (
                <button
                  key={r.key}
                  className={`role-tab ${role === r.key ? 'active' : ''}`}
                  role="tab"
                  aria-selected={role === r.key}
                  onClick={() => setRole(r.key)}
                >
                  {r.icon} {r.label}
                </button>
              ))}
              <div className="tab-indicator" ref={indicatorRef} />
            </div>

            {/* Panels */}
            {role === 'student' && <div className="role-panel active"><StudentPanel onLogin={() => setForgotOpen(true)} /></div>}
            {role === 'teacher' && <div className="role-panel active"><TeacherPanel onLogin={() => setForgotOpen(true)} /></div>}
            {role === 'admin'   && <div className="role-panel active"><AdminPanel onLogin={() => setForgotOpen(true)} /></div>}
          </div>
        </main>
      </div>

      <ForgotModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
