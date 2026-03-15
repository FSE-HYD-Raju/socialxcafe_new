import { useState, useRef } from "react";
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

import { db } from "../../firebase/firebase";
import QRCode from "qrcode";
import Confetti from "react-confetti";
import { toPng } from "html-to-image";

export default function RegisterEventModal({ event, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const [error, setError] = useState("");

  const ticketRef = useRef();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const downloadTicket = async () => {
    const dataUrl = await toPng(ticketRef.current);

    const link = document.createElement("a");
    link.download = "event-ticket.png";
    link.href = dataUrl;
    link.click();
  };

  const handlePayment = async () => {
    setError("");

    if (!form.name || !form.phone) {
      setError("Name & Phone required");
      return;
    }

    if (event.registeredCount >= event.capacity) {
      setError("Event is Full");
      return;
    }

    setLoading(true);

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

          const generatedQR = await QRCode.toDataURL(qrValue, {
            width: 1000,
            margin: 2,
            errorCorrectionLevel: "H",
          });

          setQrImage(generatedQR);
          setRegistrationId(regRef.id);

          setSuccess(true);
          // 🎉 Trigger confetti
          setShowConfetti(true);

          setTimeout(() => {
            setShowConfetti(false);
          }, 2500);
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}

        <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            Registration Successful 🎉
          </h2>

          {/* TICKET */}

          <div
            ref={ticketRef}
            className="bg-white border rounded-xl overflow-hidden mb-6"
          >
            <div className="bg-black text-white p-4">
              <h3 className="font-semibold text-lg">{event.title}</h3>

              <p className="text-xs opacity-80">SocialX Event Ticket</p>
            </div>

            <div className="p-5 text-center">
              <img src={qrImage} alt="QR" className="w-40 mx-auto mb-4" />

              <p className="text-sm">
                <strong>Name:</strong> {form.name}
              </p>

              <p className="text-sm">
                <strong>Phone:</strong> {form.phone}
              </p>

              <p className="text-sm">
                <strong>Ticket ID:</strong> {registrationId}
              </p>
            </div>

            <div className="bg-gray-100 text-xs text-gray-500 py-2">
              Show this QR at event entrance
            </div>
          </div>

          <button
            onClick={downloadTicket}
            className="bg-primary text-white px-6 py-2 rounded-xl mb-3"
          >
            Download Ticket
          </button>

          <button onClick={onClose} className="block mx-auto text-gray-500">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
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
