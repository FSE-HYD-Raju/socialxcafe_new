import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import * as XLSX from "xlsx";

import { db } from "../../firebase/firebase";

import CreateEventModal from "../../features/events/CreateEventModal";
import EditEventModal from "../../features/events/EditEventModal";
import ConfirmDeleteModal from "../../components/common/DeleteCofirmation";
import MemberCheckInModal from "../../features/events/MemberCheckInModal";

import { formatDisplayDate, formatDisplayTime } from "../../utils/dateTime";
import { updateEventStatusIfNeeded } from "../../utils/eventStatus";

import { useNavigate } from "react-router-dom";

export default function OrganizerEvents() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events, setEvents] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), async (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((e) => e.organizerId === user.uid);

      for (const event of list) {
        await updateEventStatusIfNeeded(event);
      }

      setEvents(list);
    });

    return () => unsub();
  }, []);

  const exportEvents = () => {
    const data = events.map((e) => ({
      Title: e.title,
      Category: e.category,
      Date: formatDisplayDate(e.eventDate),
      Start: formatDisplayTime(e.startTime),
      End: formatDisplayTime(e.endTime),
      Price: e.price,
      Capacity: e.capacity,
      Registered: e.registeredCount || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "My Events");

    XLSX.writeFile(wb, "organizer-events.xlsx");
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-8">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">My Events</h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage your hosted events
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportEvents}
            className="border px-4 py-2 rounded-xl text-sm"
          >
            Export
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm"
          >
            + Event
          </button>
        </div>
      </div>

      {/* FILTERS */}

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          placeholder="Search event"
          className="border px-4 py-2 rounded-xl w-full sm:w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-xl w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* EVENTS */}

      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No events created yet
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const registered = event.registeredCount || 0;
            const revenue = registered * (event.price || 0);

            return (
              <div
                key={event.id}
                className="bg-white border rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                {/* POSTER */}

                <div className="h-44 bg-gray-200 overflow-hidden">
                  {event.poster ? (
                    <img
                      src={event.poster}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      No Poster
                    </div>
                  )}
                </div>

                {/* CONTENT */}

                <div className="p-5">
                  {/* TITLE + STATUS */}

                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-semibold text-lg">{event.title}</h2>

                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                      {event.status}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm mb-3">{event.category}</p>

                  {/* DATE */}

                  <div className="text-sm text-gray-600 mb-4">
                    <p>{formatDisplayDate(event.eventDate)}</p>

                    <p className="text-xs text-gray-500">
                      {formatDisplayTime(event.startTime)}
                      {" - "}
                      {formatDisplayTime(event.endTime)}
                    </p>
                  </div>

                  {/* STATS */}

                  <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    <Stat
                      label="Seats"
                      value={`${registered}/${event.capacity}`}
                    />

                    <Stat label="Price" value={`₹${event.price}`} />

                    <Stat label="Revenue" value={`₹${revenue}`} />
                  </div>

                  {/* ACTIONS */}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEditEvent(event)}
                      className="border rounded-lg py-2 text-sm hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteEvent(event)}
                      className="border border-red-500 text-red-600 rounded-lg py-2 text-sm hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/organizer/events/${event.id}/registrations`)
                      }
                      className="border border-primary text-primary rounded-lg py-2 text-sm hover:bg-primary hover:text-white"
                    >
                      Registrations
                    </button>

                    {event.status === "live" && (
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="bg-green-600 text-white rounded-lg py-2 text-sm"
                      >
                        Check-In
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}

      {editEvent && (
        <EditEventModal event={editEvent} onClose={() => setEditEvent(null)} />
      )}

      {deleteEvent && (
        <ConfirmDeleteModal
          title="Delete Event"
          message={`Delete "${deleteEvent.title}"?`}
          onCancel={() => setDeleteEvent(null)}
          onConfirm={async () => {
            await deleteDoc(doc(db, "events", deleteEvent.id));
            setDeleteEvent(null);
          }}
        />
      )}

      {selectedEvent && (
        <MemberCheckInModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}
