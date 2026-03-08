import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function EditEventModal({ event, onClose }) {
  const [form, setForm] = useState({
    title: event.title || "",
    description: event.description || "",
    status: event.status || null,
    price: event.price || "",
    capacity: event.capacity || "",
    organizerName: event.organizerName || "",
    organizerPhone: event.organizerPhone || "",
    eventDate: event.eventDate
      ? new Date(event.eventDate.seconds * 1000).toISOString().slice(0, 16)
      : "",
    registrationDeadline: event.registrationDeadline
      ? new Date(event.registrationDeadline.seconds * 1000)
          .toISOString()
          .slice(0, 16)
      : "",
  });
  const handleSubmit = async () => {
    await updateDoc(doc(db, "events", event.id), {
      ...form,
      price: Number(form.price),
      capacity: Number(form.capacity),
      eventDate: new Date(form.eventDate),
      registrationDeadline: form.registrationDeadline
        ? new Date(form.registrationDeadline)
        : null,
    });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[600px]">
        <h2 className="text-xl font-semibold mb-6">Host Community Event</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Title</label>
            <input
            value={form.title}
              className="border px-4 py-2 rounded-xl w-full"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Description
            </label>
            <textarea
             value={form.description}
              className="border px-4 py-2 rounded-xl w-full"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Event Date
              </label>
              <input
               value={form.eventDate}
                type="date"
                className="border px-4 py-2 rounded-xl  w-full"
                onChange={(e) =>
                  setForm({ ...form, eventDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Start Time
              </label>
              <input
               value={form.startTime}
                type="time"
                className="border px-4 py-2 rounded-xl  w-full"
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                End Time
              </label>
              <input
               value={form.endTime}
                type="time"
                className="border px-4 py-2 rounded-xl  w-full"
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Price</label>
              <input
               value={form.price}
                type="number"
                className="border px-4 py-2 rounded-xl"
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Capacity
              </label>
              <input
               value={form.capacity}
                type="number"
                className="border px-4 py-2 rounded-xl"
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Organizer Name
              </label>

              <input
               value={form.organizerName}
                className="border px-4 py-2 rounded-xl"
                onChange={(e) =>
                  setForm({ ...form, organizerName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Organizer Phone
              </label>
              <input
               value={form.organizerPhone}
                className="border px-4 py-2 rounded-xl"
                onChange={(e) =>
                  setForm({ ...form, organizerPhone: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Registration Deadline
            </label>
            <input
             value={form.registrationDeadline}
              type="datetime-local"
              className="border px-4 py-2 rounded-xl w-full"
              onChange={(e) =>
                setForm({
                  ...form,
                  registrationDeadline: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-4 py-2 rounded-xl flex-1"
          >
            Submit Event
          </button>
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-xl flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
