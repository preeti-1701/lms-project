import { createContext, useContext, useState } from 'react'
import { setTokens, clearTokens, getUser, setUser, getAccessToken } from '../utils/tokenStorage'
import { loginApi, logoutApi } from '../api/auth.api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getUser())

  const login = async (email, password) => {
    const res = await loginApi(email, password)
    setTokens(res.data.access, res.data.refresh)
    setUser(res.data.user)
    setUserState(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // continue even if logout API fails
    }
    clearTokens()
    setUserState(null)
    window.location.href = '/login'
  }

  const isAuthenticated = () => !!getAccessToken()

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)