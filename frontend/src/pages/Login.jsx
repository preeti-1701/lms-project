import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import FormInput from "../components/FormInput"
import Button from "../components/Button"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(username, password)
      navigate("/dashboard")
    } catch {
      setError("Invalid username or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e3231] to-[#2a4544] items-center justify-center px-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            SimpleLMS
          </h1>
          <p className="text-lg text-gray-300">
            Learn at your own pace
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <h2 className="text-2xl font-bold text-[#1e3231]">
              SimpleLMS
            </h2>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-[#1e3231] mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 mb-8">
            Sign in to continue learning
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            <FormInput
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={error}
              required
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              required
            />

            <div className="mt-2">
              <Button type="submit" loading={loading}>
                Sign in
              </Button>
            </div>

          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#931621] font-bold">
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}