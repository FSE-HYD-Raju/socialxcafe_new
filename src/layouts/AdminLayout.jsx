import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function AdminLayout() {
  const navigate = useNavigate();
  const prevOrderCount = useRef(0);
  const [liveStats, setLiveStats] = useState({
    pendingOrders: 0,
    customers: 0,
    todayRevenue: 0,
  });
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!user) {
      navigate("/admin/login");
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  // 🔴 Real-time listeners
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const unsubscribeOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        let pending = 0;
        let revenue = 0;
        let todayActivities = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const orderDate = data.createdAt?.toDate?.().toDateString();
          if (data.status === "pending") {
            pending++;
          }
          if (data.status === "paid" && orderDate === todayStr) {
            revenue += data.totalAmount || 0;
          }
          todayActivities.push({
            id: doc.id,
            message: `Order ₹${data.totalAmount} - ${data.status}`,
            time: data.createdAt?.toDate?.().toLocaleTimeString() || "",
          });
        });
        // 🔔 Play sound if new order added
        if (snapshot.size > prevOrderCount.current) {
          playNotificationSound();
        }
        prevOrderCount.current = snapshot.size;
        setLiveStats((prev) => ({
          ...prev,
          pendingOrders: pending,
          todayRevenue: revenue,
        }));
      },
    );
    const unsubscribeCustomers = onSnapshot(
      collection(db, "customers"),
      (snapshot) => {
        setLiveStats((prev) => ({
          ...prev,
          customers: snapshot.size,
        }));
      },
    );
    return () => {
      unsubscribeOrders();
      unsubscribeCustomers();
    };
  }, []);

  const navItem = "px-4 py-2 text-sm rounded-lg transition hover:bg-white/10";
  const activeItem = "bg-primary text-white";

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-heading tracking-widest">SOCIALX CONTROL</h1>
          {/* Live Stats */}
          {(user?.role === "admin" || user?.role === "staff") && (
            <div className="flex gap-6 text-xs">
              <StatusPill
                label="Pending"
                value={liveStats.pendingOrders}
                alert={liveStats.pendingOrders > 5}
              />
              <StatusPill
                label="Revenue Today"
                value={`₹${liveStats.todayRevenue}`}
              />
              <StatusPill label="Customers" value={liveStats.customers} />
            </div>
          )}
          <div className="flex items-center gap-6 text-sm">
            <span>{new Date().toLocaleDateString()}</span>
            <button
              onClick={handleLogout}
              className="border border-red-500 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
        {/* NAVIGATION */}
        <div className="max-w-7xl mx-auto px-6 pb-4">
          <nav className="flex gap-2 text-sm">
            {user?.role === "admin" && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? activeItem : ""}`
                }
              >
                Dashboard
              </NavLink>
            )}

            {(user?.role === "admin" || user?.role === "staff") && (
              <>
                <NavLink
                  to="/admin/orders"
                  className={({ isActive }) =>
                    `${navItem} ${isActive ? activeItem : ""}`
                  }
                >
                  Orders
                </NavLink>

                <NavLink
                  to="/admin/menu"
                  className={({ isActive }) =>
                    `${navItem} ${isActive ? activeItem : ""}`
                  }
                >
                  Menu
                </NavLink>
              </>
            )}

            {(user?.role === "admin" ||
              user?.role === "staff" ||
              user?.role === "eventOrganizer") && (
              <NavLink
                to="/admin/events"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? activeItem : ""}`
                }
              >
                Events
              </NavLink>
            )}

            {(user?.role === "admin" || user?.role === "staff") && (
              <NavLink
                to="/admin/customers"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? activeItem : ""}`
                }
              >
                Customers
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? activeItem : ""}`
                }
              >
                Users
              </NavLink>
            )}
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

function StatusPill({ label, value, alert }) {
  return (
    <div
      className={`px-4 py-2 rounded-full border text-xs ${
        alert
          ? "bg-red-600 animate-pulse border-red-500"
          : "bg-white/10 border-white/10"
      }`}
    >
      {label}: <span className="font-semibold">{value}</span>
    </div>
  );
}

// 🔔 Notification Sound
function playNotificationSound() {
  const audio = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  );
  audio.play();
}
