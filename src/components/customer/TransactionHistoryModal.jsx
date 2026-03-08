import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  getDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function TransactionHistoryModal({ customer, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(customer.walletBalance || 0);
  const [showManage, setShowManage] = useState(false);
  const [type, setType] = useState("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    // Fetch transactions
    const q = query(
      collection(db, "walletTransactions"),
      where("customerId", "==", customer.id),
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    const sorted = data.sort(
      (a, b) => a.createdAt?.seconds - b.createdAt?.seconds,
    );
    setTransactions(sorted);
    // Refresh balance
    const customerSnap = await getDoc(doc(db, "customers", customer.id));
    setBalance(customerSnap.data()?.walletBalance || 0);
  };
  const handleWalletUpdate = async () => {
    if (!amount || Number(amount) <= 0) return;
    const numericAmount = Number(amount);
    // Prevent negative balance
    if (type === "debit" && balance < numericAmount) {
      alert("Insufficient balance");
      return;
    }
    const customerRef = doc(db, "customers", customer.id);
    let incrementValue = 0;
    let transactionAmount = numericAmount;
    if (type === "credit") {
      incrementValue = numericAmount;
    }
    if (type === "debit") {
      incrementValue = -numericAmount;
    }
    if (type === "adjustment") {
      // Set exact balance
      incrementValue = numericAmount - balance;
    }
    // 1️⃣ Update wallet atomically
    await updateDoc(customerRef, {
      walletBalance: increment(incrementValue),
    });
    // 2️⃣ Add transaction record
    await addDoc(collection(db, "walletTransactions"), {
      customerId: customer.id, // ✅ FIXED (was phone earlier)
      type,
      amount: transactionAmount,
      note:
        note ||
        (type === "credit"
          ? "Manual Add"
          : type === "debit"
            ? "Manual Deduct"
            : "Balance Adjustment"),
      createdAt: serverTimestamp(),
    });
    setShowManage(false);
    setAmount("");
    setNote("");
    fetchData();
  };
  const handleWalletCancel = () => {
    setShowManage(false);
    setAmount("");
    setNote("");
  };
  let runningBalance = 0;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-3xl w-[780px] relative shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        {/* Header */}
        <h2 className="text-2xl font-semibold mb-6">
          {customer.name} – Wallet
        </h2>
        {/* Balance Section */}
        <div className="flex justify-between items-center mb-6 bg-gray-50 p-5 rounded-2xl">
          <div>
            <p className="text-sm text-gray-500">Current Balance</p>
            <h3 className="text-2xl font-semibold text-green-600">
              ₹{balance}
            </h3>
          </div>
          <button
            onClick={() => setShowManage(!showManage)}
            className="bg-primary text-white px-5 py-2 rounded-xl text-sm"
          >
            Manage Wallet
          </button>
        </div>
        {/* Manage Wallet Row */}
        {showManage && (
          <div className="bg-blue-50 p-4 rounded-2xl mb-6 flex gap-3 items-center">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border px-3 py-2 rounded-xl text-sm"
            >
              <option value="credit">Add Balance</option>
              <option value="debit">Deduct Balance</option>
              <option value="adjustment">Set Balance</option>
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border px-3 py-2 rounded-xl w-32 text-sm"
            />
            <input
              type="text"
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border px-3 py-2 rounded-xl flex-1 text-sm"
            />
            <button
              onClick={handleWalletUpdate}
              className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm"
            >
              Save
            </button>
            <button
              onClick={handleWalletCancel}
              className="border px-4 py-2 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        )}
        {/* Transactions Table */}
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Balance</th>
                <th className="p-3 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                if (t.type === "credit") runningBalance += t.amount;
                else if (t.type === "debit") runningBalance -= t.amount;
                else if (t.type === "adjustment") runningBalance = t.amount;
                return (
                  <tr key={t.id} className="border-b">
                    <td className="p-3">
                      {t.createdAt?.toDate()?.toLocaleString()}
                    </td>
                    <td
                      className={`p-3 ${
                        t.type === "credit"
                          ? "text-green-600"
                          : t.type === "debit"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      {t.type}
                    </td>
                    <td className="p-3">₹{t.amount}</td>
                    <td className="p-3 font-medium">₹{runningBalance}</td>
                    <td className="p-3 text-gray-500">{t.note || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
