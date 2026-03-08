import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("today");
  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });
    const unsubEvents = onSnapshot(collection(db, "events"), (snap) => {
      setEvents(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });
    return () => {
      unsubOrders();
      unsubEvents();
    };
  }, []);
  const now = new Date();
  const getDate = (ts) => (ts?.seconds ? new Date(ts.seconds * 1000) : null);
  const filteredOrders = orders.filter((o) => {
    const d = getDate(o.createdAt);
    if (!d) return false;
    if (filter === "today") return d.toDateString() === now.toDateString();
    if (filter === "month")
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    return true;
  });
  const revenue = filteredOrders.reduce(
    (sum, o) => sum + Number(o.totalAmount || 0),
    0,
  );
  const totalOrders = filteredOrders.length;
  const activeEvents = events.filter((e) => e.status === "live").length;
  const activeOrders = orders.filter((o) => o.status === "in_progress");
  const snooker = activeOrders.filter((o) =>
    o.items?.some((i) => i.name?.toLowerCase().includes("snooker")),
  ).length;
  const foosball = activeOrders.filter((o) =>
    o.items?.some((i) => i.name?.toLowerCase().includes("foosball")),
  ).length;
  const workspace = activeOrders.filter((o) =>
    o.items?.some((i) => i.name?.toLowerCase().includes("workspace")),
  ).length;
  const motion = activeOrders.filter((o) =>
    o.items?.some((i) => i.name?.toLowerCase().includes("motion")),
  ).length;
  const activeServices = snooker + foosball + workspace + motion;
  // CATEGORY DATA
  const categoryCounts = {};
  filteredOrders.forEach((order) => {
    order.items?.forEach((item) => {
      const cat = item.category || "Other";
      const qty = item.quantity || item.qty || 1;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + qty;
    });
  });
  const pieData = Object.keys(categoryCounts).map((k) => ({
    name: k,
    value: categoryCounts[k],
  }));
  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];
  // TOP ITEMS
  const itemMap = {};
  filteredOrders.forEach((order) => {
    order.items?.forEach((item) => {
      const qty = item.quantity || item.qty || 1;
      itemMap[item.name] = (itemMap[item.name] || 0) + qty;
    });
  });
  const topItems = Object.entries(itemMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  // 7 DAY REVENUE
  const revenueData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayRevenue = orders
      .filter((o) => {
        const date = getDate(o.createdAt);
        if (!date) return false;
        return date.toDateString() === d.toDateString();
      })
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    revenueData.push({
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: dayRevenue,
    });
  }
  // LIVE ACTIVITY
  const activities = [...orders]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 8)
    .map((o) => ({
      text: `${o.customerName || "Walk-in"} • ₹${o.totalAmount || 0}`,
      status: o.status,
      time: getDate(o.createdAt)?.toLocaleTimeString() || "",
    }));
  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          {["today", "month", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition
             ${
               filter === f
                 ? "bg-primary text-white shadow"
                 : "bg-white border hover:bg-gray-50"
             }`}
            >
              {f === "today"
                ? "Today"
                : f === "month"
                  ? "This Month"
                  : "Overall"}
            </button>
          ))}
        </div>
      </div>
      {/* KPI */}
      <div className="grid md:grid-cols-5 gap-6 mb-10">
        <Card title="Revenue" value={`₹${revenue}`} color="green" />
        <Card title="Orders" value={totalOrders} color="blue" />
        <Card title="Active Services" value={activeServices} color="purple" />
        <Card title="Active Events" value={activeEvents} color="orange" />
        <Card title="Top Item" value={topItems[0]?.name || "-"} color="teal" />
      </div>
      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow">
          <h3 className="font-semibold mb-4 text-indigo-600">7 Day Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow">
          <h3 className="font-semibold mb-4 text-purple-600">
            Orders by Category
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={90} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* OPERATIONS */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow">
          <h3 className="font-semibold mb-4 text-green-600">
            Top Selling Items
          </h3>
          {topItems.map((i) => (
            <div
              key={i.name}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{i.name}</span>
              <span className="font-medium text-indigo-600">{i.qty}</span>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-3xl shadow">
          <h3 className="font-semibold mb-4 text-orange-600">
            Cafe Floor Status
          </h3>
          <p>🎱 Snooker Active: {snooker}</p>
          <p>⚽ Foosball Active: {foosball}</p>
          <p>💻 Workspace Active: {workspace}</p>
          <p>🎮 Motion Games Active: {motion}</p>
        </div>
      </div>
      {/* LIVE ACTIVITY */}
      <div className="bg-white p-6 rounded-3xl shadow">
        <h3 className="font-semibold mb-4 text-indigo-600">Live Activity</h3>
        {activities.map((a, i) => (
          <div key={i} className="flex justify-between border-b py-2 text-sm">
            <span>{a.text}</span>
            <div className="flex gap-3 text-xs">
              <span
                className={`px-2 py-1 rounded-full ${
                  a.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {a.status}
              </span>
              <span className="text-gray-400">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  const styles = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
    teal: "bg-teal-50 text-teal-700",
  };
  return (
    <div
      className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition ${styles[color]}`}
    >
      <p className="text-sm opacity-70">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
