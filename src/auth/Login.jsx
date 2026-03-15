import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebase/firebase";
import { useAuth } from "./AuthProvider";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", form.username),
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setError("User not found");
        setLoading(false);
        return;
      }

      const docData = snap.docs[0].data();

      const userCredential = await signInWithEmailAndPassword(
        auth,
        docData.email,
        form.password,
      );

      const userData = {
        uid: snap.docs[0].id,
        ...docData,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      if (docData.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (docData.role === "staff") {
        navigate("/admin/orders", { replace: true });
      } else if (docData.role === "eventOrganizer") {
        navigate("/organizer/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6">
      {/* Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-wide">
            SocialX Control
          </h1>
          <p className="text-sm text-gray-500 mt-2">Admin Access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Username */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-8">
          SocialX Cafe Management
        </div>
      </div>
    </div>
  );
}
