import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import * as XLSX from "xlsx";
export default function EventRegistrationsModal({
  event,
  onClose,
}) {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const q = query(
      collection(db, "eventRegistrations"),
      where("eventId", "==", event.id),
    );
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setRegistrations(list);
      // Auto update count
      await updateDoc(doc(db, "events", event.id), {
        registeredCount: list.length,
      });
    });

    return () => unsub();
  }, [event.id]);

  const filtered = registrations.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search),
  );

  const exportData = () => {
    const data = registrations.map((r) => ({
      Name: r.name,
      Phone: r.phone,
      Email: r.email,
      Payment: r.paymentStatus,
      Attended: r.attended ? "Yes" : "No",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, `${event.title}_registrations.xlsx`);
  };

  const toggleAttendance = async (id, value) => {
    await updateDoc(doc(db, "eventRegistrations", id), {
      attended: value,
    });
  };

  const markPaid = async (id) => {
    await updateDoc(doc(db, "eventRegistrations", id), {
      paymentStatus: "Paid",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[900px] max-w-[95%]">
        <h2 className="text-xl font-semibold mb-4">
          {event.title} Registrations
        </h2>
        <div className="flex justify-between mb-4">
          <input
            placeholder="Search by name or phone"
            className="border px-4 py-2 rounded-xl w-1/2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={exportData} className="border px-4 py-2 rounded-xl">
            Export
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Attended</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.phone}</td>
                  <td className="p-3">
                    {r.paymentStatus !== "Paid" ? (
                      <button
                        onClick={() => markPaid(r.id)}
                        className="text-blue-600 text-xs"
                      >
                        Mark Paid
                      </button>
                    ) : (
                      "Paid"
                    )}
                  </td>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={r.attended || false}
                      readOnly
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="border px-4 py-2 rounded-xl">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
