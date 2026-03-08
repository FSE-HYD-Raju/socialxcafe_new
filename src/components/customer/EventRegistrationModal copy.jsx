import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import QRCode from "qrcode";
import Confetti from "react-confetti";

export default function EventRegistrationModal({ event, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const handlePayment = async () => {
    if (!form.name || !form.phone) {
      alert("Name & Phone required");
      return;
    }
    setLoading(true);
    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: event.price * 100,
      currency: "INR",
      name: "SocialX Cafe",
      description: event.title,
      handler: async function (response) {
        try {
          const verifyPayment = httpsCallable(
            functions,
            "verifyRazorpayPayment",
          );
          const result = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            eventId: event.id,
            userData: form,
          });
          if (result.data.success) {
            const qrValue = `${event.id}|${result.data.registrationId}`;
            const generatedQR = await QRCode.toDataURL(qrValue);
            setQrImage(generatedQR);
            setSuccess(true);
            const message = `
                🎉 Registration Confirmed!
                Event: ${event.title}
                Name: ${form.name}
                Show QR at entry.
            `;
            const whatsappURL = `https://wa.me/91${form.phone}?text=${encodeURIComponent(
              message,
            )}`;
            window.open(whatsappURL, "_blank");
          }
        } catch (err) {
          alert("Payment verification failed");
        }
      },
      theme: { color: "#000000" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={400}
        />
        <div className="bg-white p-8 rounded-2xl w-[420px] text-center relative z-10">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">
            Registration Successful 🎉
          </h2>
          <p className="text-sm text-muted mb-6">
            Show this QR at the entrance.
          </p>
          <img src={qrImage} alt="QR Code" className="mx-auto mb-6" />
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
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />
          <input
            placeholder="Phone Number"
            className="border px-4 py-2 rounded-xl w-full"
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />
          <input
            placeholder="Email (Optional)"
            className="border px-4 py-2 rounded-xl w-full"
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />
        </div>
        <div className="mt-6 text-sm text-muted">Price: ₹{event.price}</div>
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
