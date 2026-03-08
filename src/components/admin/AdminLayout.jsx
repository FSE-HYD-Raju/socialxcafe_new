import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminLayout() {
  const navigate = useNavigate();
  const prevOrderCount = useRef(0);
  const [liveStats, setLiveStats] = useState({
    pendingOrders: 0,
    customers: 0,
    todayRevenue: 0,
  });
  const [activities, setActivities] = useState([]);
  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
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
        setActivities(todayActivities.slice(-5).reverse());
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
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeItem : ""}`
              }
            >
              Dashboard
            </NavLink>
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
            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeItem : ""}`
              }
            >
              Events
            </NavLink>
            <NavLink
              to="/admin/customers"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeItem : ""}`
              }
            >
              Customers
            </NavLink>
          </nav>
        </div>
      </header>
      {/* CONTENT */}
      <main className="max-w-7xl mx-auto p-8">
        {/* Live Activity Feed */}
        {/* <div className="mb-10 bg-slate-900/80 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm uppercase tracking-wide mb-4 text-white/60">
            Live Activity
          </h2>
          {activities.length === 0 && (
            <p className="text-white/40 text-sm">No recent activity.</p>
          )}
          <div className="flex flex-col gap-3 text-sm">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex justify-between border-b border-white/5 pb-2"
              >
                <span>{a.message}</span>
                <span className="text-white/40">{a.time}</span>
              </div>
            ))}
          </div>
        </div> */}
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
