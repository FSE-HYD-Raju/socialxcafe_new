import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function EditUserModal({ user, onClose }) {
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    role: user.role || "staff",
  });

  const update = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleUpdate = async () => {
    await updateDoc(doc(db, "users", user.id), {
      username: form.username,
      email: form.email,
      role: form.role,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[420px] p-8">
        <h2 className="text-xl font-semibold mb-6">Edit User</h2>

        <div className="space-y-4">
          {/* USERNAME */}

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Username</label>

            <input
              value={form.username}
              className="border px-4 py-2 rounded-xl w-full"
              onChange={(e) => update("username", e.target.value)}
            />
          </div>

          {/* EMAIL */}

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>

            <input
              value={form.email}
              className="border px-4 py-2 rounded-xl w-full"
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          {/* ROLE */}

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Role</label>

            <select
              value={form.role}
              className="border px-4 py-2 rounded-xl w-full"
              onChange={(e) => update("role", e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="eventOrganizer">Organizer</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleUpdate}
            className="bg-primary text-white px-6 py-2 rounded-xl flex-1"
          >
            Update
          </button>

          <button
            onClick={onClose}
            className="border px-6 py-2 rounded-xl flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
