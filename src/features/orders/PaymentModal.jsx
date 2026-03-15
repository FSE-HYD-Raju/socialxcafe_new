import { useState } from "react";
import { db } from "../../firebase/firebase";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function PaymentModal({ order, customers, onClose, refresh }) {
  const customer = customers.find((c) => c.id === order.customerId);
  const [walletUse, setWalletUse] = useState(0);
  const remaining = order.totalAmount - walletUse;
  const handlePayment = async () => {
    if (walletUse > customer.walletBalance) {
      alert("Insufficient wallet balance");
      return;
    }
    await updateDoc(doc(db, "orders", order.id), {
      status: "paid",
      walletUsed: walletUse,
      cashPaid: remaining,
      paidAt: serverTimestamp(),
    });
    if (walletUse > 0) {
      await updateDoc(doc(db, "customers", customer.id), {
        walletBalance: customer.walletBalance - walletUse,
      });
      await addDoc(collection(db, "walletTransactions"), {
        customerId: customer.id,
        type: "debit",
        amount: walletUse,
        note: "Order Payment",
        createdAt: serverTimestamp(),
      });
    }
    onClose();
    refresh();
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[420px]">
        <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>
        <p>Total: ₹{order.totalAmount}</p>
        <p className="text-sm text-gray-500 mb-4">
          Wallet Balance: ₹{customer?.walletBalance || 0}
        </p>
        <input
          disabled={customer?.walletBalance === 0}
          type="number"
          value={walletUse}
          onChange={(e) => setWalletUse(Number(e.target.value))}
          className="border px-4 py-2 rounded-xl w-full mb-4"
          placeholder="Use wallet amount"
        />
        <p className="mb-6">Cash to collect: ₹{remaining}</p>
        <div className="flex gap-4">
          <button
            onClick={handlePayment}
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex-1"
          >
            Confirm
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
