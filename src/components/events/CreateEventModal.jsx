import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function CreatePublicEventModal({ onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    price: "",
    capacity: "",
    registrationDeadline: "",
    organizerName: "",
    organizerPhone: "",
    status: "draft",
  });
  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.eventDate ||
      !form.startTime ||
      !form.description ||
      !form.price ||
      !form.capacity ||
      !form.organizerName ||
      !form.organizerPhone
    ) {
      alert("Fill required fields");
      return;
    }
    await addDoc(collection(db, "events"), {
      ...form,
      price: Number(form.price),
      capacity: Number(form.capacity),
      eventDate: new Date(form.eventDate),
      status: "draft",
      registrationDeadline: form.registrationDeadline
        ? new Date(form.registrationDeadline)
        : null,
      registeredCount: 0,
      createdAt: serverTimestamp(),
    });
    alert("Event submitted for approval");
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
              className="border px-4 py-2 rounded-xl w-full"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Description
            </label>
            <textarea
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
