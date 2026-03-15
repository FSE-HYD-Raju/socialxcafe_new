import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../../firebase/firebase";

export default function EventRegistrations() {
  const { eventId } = useParams();
  const [list, setList] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "eventRegistrations"),
      where("eventId", "==", eventId),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setList(data);
    });

    return () => unsub();
  }, [eventId]);

  return (
    <div className="bg-white border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {list.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-4">{r.name}</td>
              <td>{r.email}</td>
              <td>{r.phone}</td>

              <td>
                {r.attended ? (
                  <span className="text-green-600 font-medium">Checked In</span>
                ) : (
                  <span className="text-gray-500">Registered</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
