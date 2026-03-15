import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import RegisterEventModal from "../../features/events/RegisterEvent";
import placeholder from "../../assets/images/lib.webp";
import {
  formatDisplayDate,
  formatDisplayTime,
  parseFirestoreDate,
} from "../../utils/dateTime";

export default function EventDetail() {
  const { slug } = useParams();

  const [event, setEvent] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvent = async () => {
      const q = query(collection(db, "events"), where("slug", "==", slug));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setEvent({
          id: snap.docs[0].id,
          ...snap.docs[0].data(),
        });
      }
    };

    loadEvent();
  }, [slug]);

  if (!event) return <div className="p-20">Loading event...</div>;

  const registered = event.registeredCount || 0;
  const capacity = event.capacity || 0;
  const seatsLeft = capacity - registered;

  const shareEvent = async () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: event.title,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>
        {/* TITLE */}

        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            {event.title}
          </h1>

          <button
            onClick={shareEvent}
            className="border p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Share Event"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v14"
              />
            </svg>
          </button>
        </div>

        {/* MAIN GRID */}

        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          {/* POSTER */}

          <div>
            <img
              src={event.poster || placeholder}
              className="rounded-xl w-full object-cover"
            />

            {/* TAGS */}

            <div className="flex flex-wrap gap-2 mt-4">
              {event.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-200 text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* BOOKING CARD */}

          <div className="bg-white border rounded-xl p-6 shadow-sm h-fit">
            <div className="space-y-3 text-sm text-gray-700">
              <p>📅 {formatDisplayDate(parseFirestoreDate(event.eventDate))}</p>

              <p>
                ⏰ {formatDisplayTime(event.startTime)} –{" "}
                {formatDisplayTime(event.endTime)}
              </p>

              <p>⌛ {event.duration}</p>

              <p>👤 Age Limit - {event.ageLimit}</p>

              <p>🌐 {event.language}</p>

              <p>🎭 {event.category}</p>

              <p>
                📍 {event.venue} : {event.location}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xl font-semibold">₹{event.price} onwards</p>

              <p className="text-green-600 text-sm">Available</p>
            </div>

            <button
              onClick={() => setShowRegister(true)}
              className="mt-6 w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 hidden md:block"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* ABOUT */}

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">About The Event</h2>

          <div className="text-gray-600 leading-relaxed space-y-3">
            <p>{event.description}</p>
          </div>
        </div>

        {/* ARTISTS */}

        {event.artistNames && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Artists</h2>

            <div className="flex gap-4 flex-wrap">
              {event.artistNames.split(",").map((artist, i) => (
                <div
                  key={i}
                  className="border px-4 py-2 rounded-xl bg-white shadow-sm"
                >
                  {artist}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TERMS */}

        {event.terms && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>

            <p className="text-gray-600 text-sm">{event.terms}</p>
          </div>
        )}
      </div>

      {/* MOBILE BOOK BAR */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center md:hidden">
        <div>
          <p className="text-xs text-gray-500">Price</p>
          <p className="font-semibold">₹{event.price}</p>
        </div>

        <button
          onClick={() => setShowRegister(true)}
          className="bg-red-500 text-white px-6 py-3 rounded-xl"
        >
          Book Now
        </button>
      </div>

      {/* REGISTER MODAL */}

      {showRegister && (
        <RegisterEventModal
          event={event}
          onClose={() => setShowRegister(false)}
        />
      )}
    </div>
  );
}
