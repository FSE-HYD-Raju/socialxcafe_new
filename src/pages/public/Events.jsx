import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import CreatePublicEventModal from "../../features/events/CreateEventModal";
import placeholder from "../../assets/images/lib.webp";

export default function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Comedy",
    "Music",
    "Workshop",
    "Community",
    "Networking",
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      const list = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((e) => e.status !== "draft");

      setEvents(list);
      setFiltered(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (category === "All") {
      setFiltered(events);
    } else {
      setFiltered(events.filter((e) => e.category === category));
    }
  }, [category, events]);

  const EventCard = ({ event, index }) => {
    const registered = event.registeredCount || 0;
    console.log(event);
    const capacity = event.capacity || 0;

    const progress = capacity ? (registered / capacity) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        viewport={{ once: true }}
        onClick={() => navigate(`/events/${event.slug}`)}
        className="
        bg-white
        rounded-2xl
        shadow-sm
        hover:shadow-lg
        transition
        overflow-hidden
        cursor-pointer
      "
      >
        {/* Poster */}

        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={event.poster || placeholder}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition"
          />
        </div>

        <div className="p-3 sm:p-4">
          <p className="text-xs text-gray-400">
            {event.eventDate?.toDate()?.toDateString()}
          </p>

          <h3 className="font-semibold text-sm sm:text-base mt-1 line-clamp-2">
            {event.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">
            {event.location}
          </p>

          <div className="flex justify-between items-center mt-2">
            <span className="text-primary font-semibold text-sm">
              ₹{event.price}
            </span>

            {event.category && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {event.category}
              </span>
            )}
          </div>

          {/* seats */}

          <div className="mt-2">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section id="events" className="py-16 sm:py-24 px-4 sm:px-6 bg-section">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-heading">
            Events in Hyderabad
          </h2>

          {/* Desktop Host Button */}

          <button
            onClick={() => setShowCreate(true)}
            className="hidden sm:block bg-primary text-white px-6 py-3 rounded-full"
          >
            Host Event
          </button>

          {/* Mobile Filter Button */}

          <button
            onClick={() => setShowFilters(true)}
            className="sm:hidden border px-4 py-2 rounded-lg"
          >
            Filters
          </button>
        </div>

        {/* CATEGORY CHIPS */}

        <div className="flex gap-3 overflow-x-auto pb-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 whitespace-nowrap rounded-full text-sm border transition
              ${
                category === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* EVENTS GRID */}

          <div className="lg:col-span-3">
            {loading && <p>Loading events...</p>}

            {!loading && filtered.length === 0 && <p>No events found</p>}

            <div
              className="
              grid
              grid-cols-2
              sm:grid-cols-3
              lg:grid-cols-3
              xl:grid-cols-4
              gap-4 sm:gap-8
            "
            >
              {filtered.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING HOST BUTTON */}

      <button
        onClick={() => setShowCreate(true)}
        className="
        sm:hidden
        fixed bottom-6 right-6
        bg-primary text-white
        px-5 py-3
        rounded-full
        shadow-lg
      "
      >
        + Host
      </button>

      {/* CREATE EVENT MODAL */}

      {showCreate && (
        <CreatePublicEventModal onClose={() => setShowCreate(false)} />
      )}
    </section>
  );
}
