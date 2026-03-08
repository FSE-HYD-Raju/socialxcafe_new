import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function MemberCheckInModal({ event, onClose }) {
  const [message, setMessage] = useState("");
  const [attendee, setAttendee] = useState(null);
  const playBeep = (success = true) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = success ? 900 : 300;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
  };
  const handleScan = async (result) => {
    if (!result) return;
    try {
      const value = result?.text;
      const [qrEventId, regId] = value.split("|");
      if (qrEventId !== event.id) {
        setMessage("Wrong Event Ticket ❌");
        playBeep(false);
        setTimeout(() => setMessage(""), 2000);
        return;
      }
      const regRef = doc(db, "eventRegistrations", regId);
      const regSnap = await getDoc(regRef);
      if (!regSnap.exists()) {
        setMessage("Invalid Ticket ❌");
        playBeep(false);
        setTimeout(() => setMessage(""), 2000);
        return;
      }
      const data = regSnap.data();
      if (data.attended) {
        setMessage("Already Checked In ⚠️");
        setAttendee(data);
        playBeep(false);
        setTimeout(() => {
          setMessage("");
          setAttendee(null);
        }, 2000);
        return;
      }
      await updateDoc(regRef, { attended: true });
      await updateDoc(doc(db, "events", event.id), {
        checkedInCount: increment(1),
      });
      setAttendee(data);
      setMessage("Check-in Successful ✅");
      playBeep(true);
      setTimeout(() => {
        setMessage("");
        setAttendee(null);
      }, 2000);
    } catch {
      setMessage("Invalid QR ❌");
      playBeep(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[600px] relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          ✕
        </button>
        <h3 className="text-2xl font-semibold mb-6">
          {event.title} – Check-In
        </h3>
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={(result) => {
            if (result) handleScan(result);
          }}
          style={{ width: "100%" }}
        />
        {message && (
          <div className="mt-6 p-4 border rounded-xl">
            <p className="font-medium">{message}</p>
            {attendee && (
              <div className="text-sm mt-2">
                <p>Name: {attendee.name}</p>
                <p>Phone: {attendee.phone}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
