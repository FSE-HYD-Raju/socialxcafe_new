import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import RegisterEventModal from "./events/RegisterEvent";
import CreatePublicEventModal from "./events/CreateEventModal";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  const liveEvents = events.filter((e) => e.status === "live");
  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const completedEvents = events.filter((e) => e.status === "completed");
  const getCountdown = (eventDate) => {
    if (!eventDate) return "";
    const now = new Date();
    const eventTime = eventDate.toDate();
    const diff = eventTime - now;
    if (diff <= 0) return "Starting soon";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };
  const EventCard = ({ event, index }) => {
    const registered = event.registeredCount || 0;
    const capacity = event.capacity || 0;
    const spotsLeft = capacity - registered;
    const progress = capacity ? (registered / capacity) * 100 : 0;
    const isFull = spotsLeft <= 0;
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="
   group relative
   bg-white rounded-3xl
   border border-gray-100
   shadow-sm
   hover:shadow-2xl
   transition-all duration-500
   p-7 flex flex-col overflow-hidden
 "
      >
        {/* HOVER GRADIENT LIGHT */}
        <div
          className="
 absolute inset-0 opacity-0
 group-hover:opacity-100
 transition duration-500
 bg-gradient-to-br
 from-primary/5
 via-transparent
 to-indigo-100/20
 pointer-events-none
"
        />
        {/* LIVE BADGE */}
        {event.status === "live" && (
          <span
            className="
   text-xs px-3 py-1
   bg-red-500 text-white
   rounded-full w-fit
   animate-pulse mb-3
 "
          >
            🔴 LIVE
          </span>
        )}
        <p className="text-xs text-gray-400 mb-2">
          {event.eventDate?.toDate()?.toLocaleDateString()}
        </p>
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        <p className="text-gray-500 text-sm mb-4">{event.description}</p>
        <div className="text-sm text-gray-600 mb-3">
          ⏰ {event.startTime} – {event.endTime}
        </div>
        {/* COUNTDOWN */}
        {event.status !== "completed" && (
          <div
            className="
   text-xs bg-primary/10
   text-primary px-3 py-1
   rounded-full inline-block mb-4
 "
          >
            Starts in {getCountdown(event.eventDate)}
          </div>
        )}
        {/* SEATS PROGRESS */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{registered} joined</span>
            <span>{capacity} seats</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="
     bg-gradient-to-r
     from-primary
     to-indigo-500
     h-2 rounded-full
     transition-all duration-500
     "
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {/* FOOTER */}
        <div className="flex justify-between items-center mt-auto">
          <span className="text-lg font-semibold text-primary">
            ₹{event.price}
          </span>
          {event.status !== "completed" && (
            <button
              disabled={isFull}
              onClick={() => setSelectedEvent(event)}
              className={`
                  px-5 py-2 rounded-full text-sm font-medium
                  transition-all duration-300
                  ${
                    isFull
                      ? "bg-gray-200 text-gray-400"
                      : "bg-primary text-white hover:scale-105 hover:shadow-lg"
                  }
              `}
            >
              {isFull ? "Full" : "Register"}
            </button>
          )}
        </div>
      </motion.div>
    );
  };
  return (
    <section id="events" className="py-28 px-6 bg-section">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-16">
          <div>
            <h2 className="text-5xl font-heading mb-4">Community Events</h2>
            <p className="text-muted">
              Join experiences hosted by our community
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="
              bg-primary text-white
              px-6 py-3
              rounded-full
              font-medium
              shadow hover:shadow-lg
              transition
            "
          >
            Host Event
          </button>
        </div>
        {loading && <p>Loading events...</p>}
        {/* LIVE */}
        {liveEvents.length > 0 && (
          <>
            <h3 className="text-2xl font-semibold mb-6">🔴 Live Events</h3>
            <div className="grid md:grid-cols-3 gap-10 mb-20">
              {liveEvents.map((e, i) => (
                <EventCard event={e} index={i} />
              ))}
            </div>
          </>
        )}
        {/* UPCOMING */}
        {upcomingEvents.length > 0 && (
          <>
            <h3 className="text-2xl font-semibold mb-6">Upcoming Events</h3>
            <div className="grid md:grid-cols-3 gap-10 mb-20">
              {upcomingEvents.map((e, i) => (
                <EventCard event={e} index={i} />
              ))}
            </div>
          </>
        )}
        {/* COMPLETED */}
        {completedEvents.length > 0 && (
          <>
            <h3 className="text-2xl font-semibold mb-6 text-gray-500">
              Completed Events
            </h3>
            <div className="grid md:grid-cols-3 gap-10">
              {completedEvents.map((e, i) => (
                <EventCard event={e} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
      {selectedEvent && (
        <RegisterEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
      {showCreate && (
        <CreatePublicEventModal onClose={() => setShowCreate(false)} />
      )}
    </section>
  );
}
