import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Captcha state
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Generate Captcha on load
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaAnswer('');
  };

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pwd);

    if (pwd.length < minLength) return 'Password must be at least 8 characters long.';
    if (!hasUpper) return 'Password must contain at least one uppercase letter.';
    if (!hasLower) return 'Password must contain at least one lowercase letter.';
    if (!hasNumber) return 'Password must contain at least one number.';
    if (!hasSpecial) return 'Password must contain at least one special character.';
    
    return ''; // Valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPasswordError('');
    
    // 1. Validate Password
    const pwdValidationResult = validatePassword(password);
    if (pwdValidationResult !== '') {
      setPasswordError(pwdValidationResult);
      return;
    }

    // 2. Validate Captcha
    if (parseInt(captchaAnswer) !== (captchaNum1 + captchaNum2)) {
      setError('Incorrect Captcha answer. Please try again.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await register(fullName, email, password);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Improved error handling
      if (!err.response) {
        setError('Network Error: Could not connect to the server. Is the backend running?');
      } else {
        const errorMsg = err.response.data?.error || 'Failed to register';
        const details = err.response.data?.details;
        setError(details ? `${errorMsg}: ${details}` : errorMsg);
      }
      generateCaptcha(); // Regenerate captcha on failure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-slate-900 text-white flex items-center justify-center rounded-xl mx-auto mb-4 font-bold text-2xl shadow-lg">
            L
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create LMS Account</h1>
          <p className="text-slate-500 text-sm mt-2">Join our learning platform to start your journey</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 text-sm font-medium border border-green-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM12.395 6.234a1 1 0 00-1.414 0L8 9.22 6.519 7.74a1 1 0 00-1.414 1.414l2.192 2.192a1 1 0 001.414 0l3.704-3.704a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">First Name</label>
              <input
                type="text" required className="input-simple"
                value={firstName} onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Last Name</label>
              <input
                type="text" required className="input-simple"
                value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email" required className="input-simple"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.smith@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
            <input
              type="password" required className="input-simple"
              value={password} onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="••••••••"
            />
            {passwordError && <p className="text-[10px] font-bold text-red-500 mt-1.5">{passwordError}</p>}
            {!passwordError && (
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                8+ characters, including upper, lower, number, and symbol.
              </p>
            )}
          </div>

          {/* Security Check */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Security Check</label>
              <button type="button" onClick={generateCaptcha} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors">REFRESH ↻</button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700 whitespace-nowrap">What is {captchaNum1} + {captchaNum2}?</span>
              <input
                type="number" required className="input-simple h-10"
                value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="?"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full btn-primary-simple h-12 mt-2"
          >
            {isLoading ? 'Creating account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-4">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-bold text-slate-900 hover:underline"
            >
              Sign in
            </button>
          </p>
          <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between gap-2 overflow-x-auto">
            <button
              onClick={() => navigate('/admin-register')}
              className="flex-1 text-[10px] font-black text-red-600 hover:bg-white px-3 py-2 rounded-lg border border-red-100 transition-all shadow-sm uppercase tracking-tighter"
            >
              Admin Enrollment
            </button>
            <button
              onClick={() => navigate('/trainer-register')}
              className="flex-1 text-[10px] font-black text-amber-600 hover:bg-white px-3 py-2 rounded-lg border border-amber-100 transition-all shadow-sm uppercase tracking-tighter"
            >
              Trainer Enrollment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
