import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_CREDENTIALS } from "./config/admin";

export default function AdminLogin() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    if (
      form.username === ADMIN_CREDENTIALS.username &&
      form.password === ADMIN_CREDENTIALS.password
    ) {
      localStorage.setItem("admin_logged_in", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-section px-6">
      <div className="w-full max-w-md p-10 rounded-3xl border border-primary/10 bg-white shadow-lg">
        <h2 className="font-heading text-3xl mb-6 text-center">
          SocialX Admin
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Username"
            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-primary text-white py-3 rounded-xl hover:opacity-90 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
