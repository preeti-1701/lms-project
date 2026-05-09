import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Initialize auth - check token validity
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')

      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        // Load cached user first for instant UI
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        // Verify token with backend
        const res = await api.get('/auth/me/')
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))

      } catch (error) {
        console.log('Auth verification failed:', error)
        
        // Handle session expiration
        if (error.response?.status === 401) {
          handleSessionExpired()
        } else {
          clearAuth()
        }

      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Handle session expired - different device login
  const handleSessionExpired = () => {
    clearAuth()
    // Store the session expired flag to show appropriate message
    sessionStorage.setItem('session_expired', 'true')
  }

  // Clear all auth data
  const clearAuth = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('session_expired')
    setUser(null)
  }

  // Login function
  const login = async (email, password) => {
    const response = await api.post('/auth/login/', {
      email,
      password
    })

    const { access, refresh, user: userData } = response.data

    // Store tokens
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
    localStorage.setItem('user', JSON.stringify(userData))

    setUser(userData)
    
    // Clear session expired flag on successful login
    sessionStorage.removeItem('session_expired')

    return userData
  }

  // Logout function
  const logout = async (forceLogout = false) => {
    try {
      // If forceLogout is true (session expired), don't call API
      // Otherwise call logout endpoint
      if (!forceLogout) {
        await api.post('/auth/logout/')
      }
    } catch (err) {
      console.log('Logout API error ignored:', err)
    }

    clearAuth()
    
    // Navigate to login if session was expired
    if (forceLogout || sessionStorage.getItem('session_expired')) {
      navigate('/login?expired=true')
    }
  }

  // Cross-tab logout synchronization for backend force_logout
  useEffect(() => {
    const onStorage = (e) => {
      if (!e?.key || e.key !== 'force_logout') return
      // Another tab requested force logout: clear local auth immediately
      clearAuth()
      navigate('/login?expired=true')
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])



  // Check if session just expired
  const isSessionExpired = () => {
    return sessionStorage.getItem('session_expired') === 'true'
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isSessionExpired,
      clearAuth 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
