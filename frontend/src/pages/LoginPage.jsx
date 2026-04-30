import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");

    const data = await ctx.actions.login({ identifier, password });
    const role = data?.user?.role;
    const approved = !!data?.user?.approved;

    if (role === "admin") navigate("/adminDashboard");
    else if (role === "trainer") navigate("/trainerDashboard", { state: { approved } });
    else navigate("/sudentDashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Login</h1>
          <p className="mt-1 text-gray-600">Use email + password.</p>

          {(ctx.error || message) && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {message || ctx.error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email"
                autoComplete="username"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
              />
            </label>

            <button type="submit" className="btn btn-primary mt-2" disabled={ctx.loading}>
              {ctx.loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-indigo-700 hover:underline">
              Signup
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
