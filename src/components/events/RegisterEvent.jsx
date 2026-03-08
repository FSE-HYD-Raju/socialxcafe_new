import { useState } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import QRCode from "qrcode";
import Confetti from "react-confetti";

export default function RegisterEventModal({ event, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const handlePayment = async () => {
    setError("");
    if (!form.name || !form.phone) {
      setError("Name & Phone required");
      return;
    }
    // Capacity check
    if (event.registeredCount >= event.capacity) {
      setError("Event is Full");
      return;
    }
    setLoading(true);
    // Duplicate check
    const q = query(
      collection(db, "eventRegistrations"),
      where("eventId", "==", event.id),
      where("phone", "==", form.phone),
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      setError("You already registered for this event");
      setLoading(false);
      return;
    }
    const options = {
      key: "rzp_test_SMgKIXfUJdC1mO",
      amount: Number(event.price) * 100,
      currency: "INR",
      name: "SocialX Cafe",
      description: event.title,
      handler: async function (response) {
        try {
          const regRef = await addDoc(collection(db, "eventRegistrations"), {
            eventId: event.id,
            name: form.name,
            phone: form.phone,
            email: form.email || "",
            paymentStatus: "Paid",
            paymentId: response.razorpay_payment_id,
            attended: false,
            createdAt: new Date(),
          });
          await updateDoc(doc(db, "events", event.id), {
            registeredCount: increment(1),
          });
          const qrValue = `${event.id}|${regRef.id}`;
          const generatedQR = await QRCode.toDataURL(qrValue);
          setQrImage(generatedQR);
          setSuccess(true);
        } catch (err) {
          setError("Something went wrong");
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <Confetti width={window.innerWidth} height={window.innerHeight} />
        <div className="bg-white p-8 rounded-2xl w-[420px] text-center">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            Registration Successful 🎉
          </h2>
          <img src={qrImage} alt="QR Code" className="mx-auto mb-6" />
          <a
            href={qrImage}
            download="ticket.png"
            className="block mb-4 text-primary underline"
          >
            Download QR
          </a>
          <button
            onClick={onClose}
            className="bg-primary text-white px-6 py-2 rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[420px]">
        <h2 className="text-xl font-semibold mb-6">Register – {event.title}</h2>
        <div className="space-y-4">
          <input
            placeholder="Full Name"
            className="border px-4 py-2 rounded-xl w-full"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Phone Number"
            className="border px-4 py-2 rounded-xl w-full"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder="Email (Optional)"
            className="border px-4 py-2 rounded-xl w-full"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-xl flex-1"
          >
            {loading ? "Processing..." : "Pay & Register"}
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
