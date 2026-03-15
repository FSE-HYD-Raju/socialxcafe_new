import { useState } from "react";
import { db } from "../../firebase/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function AddCustomerModal({ onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !phone) {
      setError("Name and Phone are required.");
      return;
    }

    // 1️⃣ Create customer with 0 balance first
    const customerRef = await addDoc(collection(db, "customers"), {
      name,
      phone,
      email: email || "",
      walletBalance: 0,
      createdAt: serverTimestamp(),
    });

    // 2️⃣ If initial balance provided, credit wallet
    if (initialBalance && Number(initialBalance) > 0) {
      const amount = Number(initialBalance);
      await updateDoc(doc(db, "customers", customerRef.id), {
        walletBalance: amount,
      });

      await addDoc(collection(db, "walletTransactions"), {
        customerId: customerRef.id,
        type: "credit",
        amount,
        note: "Initial wallet balance",
        createdAt: serverTimestamp(),
      });
    }
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-heading font-semibold tracking-tight mb-6">
        Add Customer
      </h2>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-4 py-2 rounded-xl w-full text-sm"
        />
        <input
          type="text"
          placeholder="Phone *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border px-4 py-2 rounded-xl w-full text-sm"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-4 py-2 rounded-xl w-full text-sm"
        />
        <input
          type="number"
          placeholder="Initial Wallet Balance (optional)"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
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
          onClick={handleSubmit}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm"
        >
          Save
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
