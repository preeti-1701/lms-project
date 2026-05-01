import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken, setStoredUser } from '../api/client'

export default function Signup({ onLogin }) {
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef([])
  const navigate = useNavigate()

  // Cooldown tick
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCooldown])

  // =========== STEP 1: SIGNUP FORM ===========
  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await api.signup({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      })
      setStep('otp')
      setResendCooldown(60)
      // focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // =========== STEP 2: OTP VERIFICATION ===========
  const handleOtpChange = (idx, value) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[idx] = value
    setOtp(newOtp)
    setError(null)

    // auto-advance to next input
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(paste)) {
      setOtp(paste.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await api.verifyOtp(formData.email.trim().toLowerCase(), code)
      setToken(res.token)
      setStoredUser(res.user)
      onLogin(res.user)
    } catch (err) {
      setError(err.message)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await api.resendOtp(formData.email.trim().toLowerCase())
      setSuccess('A new code has been sent. Check your email.')
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // =========== RENDER ===========
  return (
    <div className="login-page">
      <div className="login-left">
        <div>
          <div className="kicker" style={{ color: 'var(--accent-soft)', marginBottom: '1rem' }}>
            <span className="kicker-dot" style={{ background: 'var(--accent)' }}></span>
            Join LearnNova
          </div>
          <h2>
            {step === 'form' ? (
              <>Start your <em>learning</em> journey.</>
            ) : (
              <>You're <em>almost</em> done.</>
            )}
          </h2>
        </div>
        <p>
          {step === 'form'
            ? "Create a free learner account. We'll email a 6‑digit code to confirm it's you."
            : `We sent a 6‑digit code to ${formData.email}. Enter it below to finish verifying your account.`}
        </p>
      </div>

      <div className="login-right">
        {step === 'form' && (
          <>
            <h1>Create your account</h1>
            <p className="sub">Quick setup — then you're in</p>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSignup}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>First name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Last name (optional)</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Creating...' : 'Create account →'}
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-softer)' }}>
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1>Confirm your email</h1>
            <p className="sub">
              Enter the 6‑digit code we sent to <strong>{formData.email}</strong>
            </p>

            {error && <div className="error-msg">{error}</div>}
            {success && (
              <div className="error-msg" style={{ background: 'rgba(47, 230, 166, 0.12)', color: 'rgba(47, 230, 166, 0.95)', borderLeftColor: 'rgba(47, 230, 166, 0.9)' }}>
                {success}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="otp-grid" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="otp-input"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || otp.join('').length !== 6}
                style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
              >
                {loading ? 'Checking...' : 'Confirm & continue →'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-softer)', textAlign: 'center' }}>
              Didn't get a code?{' '}
              {resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <a onClick={handleResend} style={{ cursor: 'pointer' }}>Send again</a>
              )}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--ink-softer)', textAlign: 'center' }}>
              <a onClick={() => setStep('form')} style={{ cursor: 'pointer' }}>← Change email</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
