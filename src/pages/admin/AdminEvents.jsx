import { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

import CreateEventModal from "../../features/events/CreateEventModal";
import EditEventModal from "../../features/events/EditEventModal";
import EventRegistrationsModal from "../../features/events/EventRegistrationsModal";
import ConfirmDeleteModal from "../../components/common/DeleteCofirmation";
import MemberCheckInModal from "../../features/events/MemberCheckInModal";

import { db } from "../../firebase/firebase";
import { formatDisplayDate, formatDisplayTime } from "../../utils/dateTime";
import { updateEventStatusIfNeeded } from "../../utils/eventStatus";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [viewRegs, setViewRegs] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), async (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      for (const event of list) {
        await updateEventStatusIfNeeded(event);
      }

      setEvents(list);
    });

    return () => unsub();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.organizerName?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || e.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || e.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [events, search, statusFilter, categoryFilter]);

  const paginated = filteredEvents.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  const approveEvent = async (event) => {
    await updateDoc(doc(db, "events", event.id), {
      status: "upcoming",
    });
  };

  const exportEvents = () => {
    const data = events.map((e) => ({
      Title: e.title,
      Date: e.eventDate,
      Price: e.price,
      Capacity: e.capacity,
      Registered: e.registeredCount || 0,
      Organizer: e.organizerName,
      Status: e.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Events");

    XLSX.writeFile(wb, "events.xlsx");
  };

  const statusBadge = (status) => {
    const map = {
      draft: "bg-yellow-100 text-yellow-700",
      upcoming: "bg-blue-100 text-blue-700",
      live: "bg-green-100 text-green-700",
      completed: "bg-gray-200 text-gray-700",
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${map[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      {/* HEADER */}

      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Events Management</h1>
          <p className="text-gray-500 text-sm">Manage cafe events</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportEvents}
            className="border px-5 py-2 rounded-xl"
          >
            Export
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary text-white px-6 py-2 rounded-xl"
          >
            + Create Event
          </button>
        </div>
      </div>

      {/* FILTERS */}

      <div className="flex gap-4 mb-6">
        <input
          placeholder="Search event or organizer"
          className="border px-4 py-2 rounded-xl w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-xl"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="border px-3 py-2 rounded-xl"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="Comedy">Comedy</option>
          <option value="Music">Music</option>
          <option value="Workshop">Workshop</option>
        </select>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4">Poster</th>
              <th>Event</th>
              <th>Date</th>
              <th>Seats</th>
              <th>Revenue</th>
              <th>Organizer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((event) => {
              const registered = event.registeredCount || 0;
              const revenue = registered * event.price;

              return (
                <tr key={event.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {event.poster && (
                        <img
                          src={event.poster}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </td>

                  <td>
                    <Link
                      to={`/events/${event.slug}`}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {event.title}
                    </Link>

                    <div className="text-xs text-gray-500">
                      {event.category}
                    </div>
                  </td>

                  <td>
                    {formatDisplayDate(event.eventDate)}

                    <div className="text-xs text-gray-500">
                      {formatDisplayTime(event.startTime)} -{" "}
                      {formatDisplayTime(event.endTime)}
                    </div>
                  </td>

                  <td>
                    {registered}/{event.capacity}
                  </td>

                  <td className="text-green-700 font-medium">₹{revenue}</td>

                  <td>
                    <div className="font-medium">{event.organizerName}</div>
                    <div className="text-xs text-gray-500">
                      {event.organizerPhone}
                    </div>
                  </td>

                  <td>{statusBadge(event.status)}</td>

                  <td>
                    <div className="flex gap-2 flex-wrap">
                      {event.status === "draft" && (
                        <button
                          onClick={() => approveEvent(event)}
                          className="px-3 py-1 text-xs rounded-lg bg-green-600 text-white"
                        >
                          Approve
                        </button>
                      )}

                      <button
                        onClick={() => setEditEvent(event)}
                        className="px-3 py-1 text-xs border rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setViewRegs(event)}
                        className="px-3 py-1 text-xs border text-blue-600 rounded-lg"
                      >
                        Registrations
                      </button>

                      <button
                        onClick={() => setDeleteEvent(event)}
                        className="px-3 py-1 text-xs border text-red-600 rounded-lg"
                      >
                        Delete
                      </button>

                      {event.status === "live" && (
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg"
                        >
                          Check-In
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="border px-3 py-1 rounded"
        >
          Prev
        </button>

        <span className="px-4 py-1">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="border px-3 py-1 rounded"
        >
          Next
        </button>
      </div>

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

      {viewRegs && (
        <EventRegistrationsModal
          event={viewRegs}
          onClose={() => setViewRegs(null)}
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
