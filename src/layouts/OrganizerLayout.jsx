import { signOut } from "firebase/auth";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

export default function OrganizerLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  const navItem = "px-4 py-2 text-sm rounded-lg transition hover:bg-white/10";
  const activeItem = "bg-primary text-white";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-heading tracking-widest">SOCIALX ORGANIZER</h1>

          <div className="flex items-center gap-6 text-sm">
            <span>{user?.email}</span>

            <button
              onClick={logout}
              className="border border-red-500 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* NAV */}

        <div className="max-w-7xl mx-auto px-6 pb-4">
          <nav className="flex gap-2 text-sm">
            <NavLink
              to="/organizer/dashboard"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeItem : ""}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/organizer/events"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeItem : ""}`
              }
            >
              My Events
            </NavLink>
          </nav>
        </div>
      </header>

      {/* CONTENT */}

      <main className="max-w-7xl mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
