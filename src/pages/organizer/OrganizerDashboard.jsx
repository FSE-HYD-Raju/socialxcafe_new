import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function OrganizerDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    events: 0,
    registrations: 0,
    revenue: 0,
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      const events = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((e) => e.organizerId === user.uid);

      let registrations = 0;
      let revenue = 0;

      events.forEach((e) => {
        registrations += e.registeredCount || 0;
        revenue += (e.registeredCount || 0) * (e.price || 0);
      });

      setStats({
        events: events.length,
        registrations,
        revenue,
      });
    });

    return () => unsub();
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <StatCard label="Events" value={stats.events} />

      <StatCard label="Registrations" value={stats.registrations} />

      <StatCard label="Revenue" value={`₹${stats.revenue}`} />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <p className="text-gray-500 text-sm">{label}</p>

      <h2 className="text-2xl font-semibold mt-2">{value}</h2>
    </div>
  );
}
