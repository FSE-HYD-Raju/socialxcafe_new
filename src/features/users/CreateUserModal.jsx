import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

export default function CreateUserModal({ onClose }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff",
  });

  const handleCreate = async () => {
    const cred = await createUserWithEmailAndPassword(
      auth,
      form.email,
      form.password,
    );

    await setDoc(doc(db, "users", cred.user.uid), {
      username: form.username,
      email: form.email,
      role: form.role,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl w-[420px]">
        <h2 className="text-xl font-semibold mb-6">Create User</h2>

        <div className="space-y-4">
          <input
            placeholder="Username"
            className="border px-4 py-2 rounded-xl w-full"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            placeholder="Email"
            className="border px-4 py-2 rounded-xl w-full"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Password"
            type="password"
            className="border px-4 py-2 rounded-xl w-full"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="border px-4 py-2 rounded-xl w-full"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="eventOrganizer">Organizer</option>
          </select>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleCreate}
            className="bg-primary text-white px-4 py-2 rounded-xl flex-1"
          >
            Create
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
