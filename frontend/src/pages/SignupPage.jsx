import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext);

  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setMessage("");
    setResult(null);

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const data = await ctx.actions.signup({
      role,
      name: name.trim(),
      email: email.trim(),
      username: "",
      password,
    });

    setResult(data);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Signup</h1>
          <p className="mt-1 text-gray-600">Create a student or trainer account.</p>

          {(ctx.error || message) && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {message || ctx.error}
            </div>
          )}

          <form onSubmit={handleSignup} className="mt-6 grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Name</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Role</span>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-gray-900"
                value={role}
                onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="trainer">Trainer</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
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
                autoComplete="new-password"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-gray-700">Confirm password</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                type="password"
                autoComplete="new-password"
              />
            </label>

            <button type="submit" className="btn btn-primary mt-2" disabled={ctx.loading}>
              {ctx.loading ? "Creating..." : "Create account"}
            </button>
          </form>

          {result ? (
            <div>
            <div className=" flex justify-between items-center mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <div className="font-medium">Account created</div>

              <div className=" flex gap-2">
                <button className="btn btn-outline" onClick={() => navigate("/login")}>
                  Login now
                </button>
              </div>
            </div>
            {result.role === "trainer" && !result.approved ? (
                <div className="mt-2">Trainer accounts require admin approval before uploading courses.</div>
              ) : null} 
              </div>
          ) : null}

          <div className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-700 hover:underline">
              Login
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
