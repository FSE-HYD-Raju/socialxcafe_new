import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function EditCustomerModal({ customer, onClose }) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email || "");
  const [error, setError] = useState("");
  const handleUpdate = async () => {
    if (!name || !phone) {
      setError("Name and Phone are required.");
      return;
    }
    await updateDoc(doc(db, "customers", customer.id), {
      name,
      phone,
      email,
    });
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-heading font-semibold tracking-tight mb-6">
        Edit Customer
      </h2>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-4 py-2 rounded-xl w-full text-sm"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border px-4 py-2 rounded-xl w-full text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-4 py-2 rounded-xl w-full text-sm"
        />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="border px-4 py-2 rounded-xl text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm"
        >
          Update
        </button>
      </div>
    </Modal>
  );
}
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-96 relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
