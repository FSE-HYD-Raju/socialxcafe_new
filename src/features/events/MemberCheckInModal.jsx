import { useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import QRScanner from "../../components/common/QRScanner";

export default function MemberCheckInModal({ event, onClose }) {
  const [message, setMessage] = useState("");
  const [attendee, setAttendee] = useState(null);
  const [phone, setPhone] = useState("");

  const playBeep = (success = true) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = success ? 900 : 300;
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
  };

  const reset = () => {
    setTimeout(() => {
      setMessage("");
      setAttendee(null);
    }, 2000);
  };

  const checkIn = async (regId) => {
    const regRef = doc(db, "eventRegistrations", regId);
    const regSnap = await getDoc(regRef);

    if (!regSnap.exists()) {
      setMessage("Invalid Ticket ❌");
      playBeep(false);
      return reset();
    }

    const data = regSnap.data();

    if (data.attended) {
      setMessage("Already Checked In ⚠️");
      setAttendee(data);
      playBeep(false);
      return reset();
    }

    await updateDoc(regRef, { attended: true });

    await updateDoc(doc(db, "events", event.id), {
      checkedInCount: increment(1),
    });

    setAttendee(data);
    setMessage("Check-in Successful ✅");
    playBeep(true);

    reset();
  };

  const handleScan = async (value) => {
    try {
      const [qrEventId, regId] = value.split("|");

      if (qrEventId !== event.id) {
        setMessage("Wrong Event Ticket ❌");
        playBeep(false);
        return reset();
      }

      await checkIn(regId);
    } catch {
      setMessage("Invalid QR ❌");
      playBeep(false);
      reset();
    }
  };

  const manualCheckin = async () => {
    if (!phone) return;

    const q = query(
      collection(db, "eventRegistrations"),
      where("eventId", "==", event.id),
      where("phone", "==", phone),
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      setMessage("No registration found ❌");
      playBeep(false);
      return reset();
    }

    await checkIn(snap.docs[0].id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* CLOSE BUTTON */}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-center mb-4">
          {event.title}
        </h2>

        {/* SCANNER */}

        <QRScanner onScan={handleScan} />

        {/* MESSAGE */}

        {message && (
          <div className="mt-4 p-4 border rounded-xl text-center">
            <p className="font-medium">{message}</p>

            {attendee && (
              <div className="text-sm mt-2">
                <p>Name: {attendee.name}</p>
                <p>Phone: {attendee.phone}</p>
              </div>
            )}
          </div>
        )}

        {/* MANUAL CHECKIN */}

        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-500 mb-2 text-center">
            Manual Check-In
          </p>

          <div className="flex gap-2">
            <input
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border px-3 py-2 rounded-lg flex-1"
            />

            <button
              onClick={manualCheckin}
              className="bg-primary text-white px-4 rounded-lg"
            >
              Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
