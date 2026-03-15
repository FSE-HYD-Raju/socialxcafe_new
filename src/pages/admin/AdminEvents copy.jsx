import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

import * as XLSX from "xlsx";

import CreateEventModal from "../../features/events/CreateEventModal";
import EditEventModal from "../../features/events/EditEventModal";
import EventRegistrationsModal from "../../features/events/EventRegistrationsModal";
import ConfirmDeleteModal from "../../components/common/DeleteCofirmation";
import MemberCheckInModal from "../../features/events/MemberCheckInModal";

import { db } from "../../firebase/firebase";

import {
  parseFirestoreDate,
  parseTime,
  formatDisplayDate,
  formatDisplayTime,
} from "../../utils/dateTime";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);

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

      const now = new Date();

      for (const event of list) {
        if (!event.eventDate || event.status === "draft") continue;

        const baseDate = parseFirestoreDate(event.eventDate);

        const start = new Date(baseDate);
        const end = new Date(baseDate);

        const startTime = parseTime(event.startTime);
        const endTime = parseTime(event.endTime);

        if (startTime) {
          start.setHours(startTime.getHours());
          start.setMinutes(startTime.getMinutes());
        }

        if (endTime) {
          end.setHours(endTime.getHours());
          end.setMinutes(endTime.getMinutes());
        }

        let newStatus = "upcoming";

        if (now >= start && now <= end) newStatus = "live";
        if (now > end) newStatus = "completed";

        if (event.status !== newStatus) {
          await updateDoc(doc(db, "events", event.id), {
            status: newStatus,
          });
        }
      }

      setEvents(list);
    });

    return () => unsub();
  }, []);

  const approveEvent = async (event) => {
    const baseDate = parseFirestoreDate(event.eventDate);

    const start = new Date(baseDate);
    const end = new Date(baseDate);

    const startTime = parseTime(event.startTime);
    const endTime = parseTime(event.endTime);

    if (startTime) {
      start.setHours(startTime.getHours());
      start.setMinutes(startTime.getMinutes());
    }

    if (endTime) {
      end.setHours(endTime.getHours());
      end.setMinutes(endTime.getMinutes());
    }

    const now = new Date();

    let status = "upcoming";

    if (now >= start && now <= end) status = "live";
    if (now > end) status = "completed";

    await updateDoc(doc(db, "events", event.id), {
      status,
    });
  };

  const exportEvents = () => {
    const data = events.map((e) => ({
      Title: e.title,
      Date: formatDisplayDate(parseFirestoreDate(e.eventDate)),
      StartTime: e.startTime,
      EndTime: e.endTime,
      Price: e.price,
      Capacity: e.capacity,
      Registered: e.registeredCount || 0,
      Revenue: (e.registeredCount || 0) * e.price,
      Organizer: e.organizerName,
      Phone: e.organizerPhone,
      Status: e.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Events");

    XLSX.writeFile(wb, "events.xlsx");
  };

  const renderSection = (title, status, badgeStyle) => {
    const filtered = events.filter((e) => e.status === status);

    if (!filtered.length) return null;

    return (
      <>
        <h2 className="text-xl font-semibold mt-8 mb-6">{title}</h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((event) => {
            const registered = event.registeredCount || 0;
            const checkedIn = event.checkedInCount || 0;

            const revenue = registered * event.price;

            const attendancePercent =
              event.capacity > 0 ? (checkedIn / event.capacity) * 100 : 0;

            return (
              <div
                key={event.id}
                className={`p-6 rounded-3xl shadow-sm border bg-white ${
                  status === "live" ? "ring-2 ring-green-300" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold">{event.title}</h2>

                  <span
                    className={`px-3 py-1 text-xs rounded-full ${badgeStyle}`}
                  >
                    {event.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-2">
                  {formatDisplayDate(parseFirestoreDate(event.eventDate))}
                  {" • "}
                  {formatDisplayTime(event.startTime)} -{" "}
                  {formatDisplayTime(event.endTime)}
                </p>

                <p className="text-sm">Revenue: ₹{revenue}</p>

                <p className="text-sm">
                  Registered: {registered}/{event.capacity}
                </p>

                {status === "live" && (
                  <p className="text-sm font-medium text-green-700 mt-2">
                    Checked In: {checkedIn}
                  </p>
                )}

                {status === "live" && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${attendancePercent}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {attendancePercent.toFixed(0)}% Attendance
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  Organizer: {event.organizerName} • {event.organizerPhone}
                </p>

                <div className="flex flex-wrap gap-3 mt-6 text-sm">
                  {status === "draft" &&
                    (user.role === "admin" || user.role === "staff") && (
                      <button
                        onClick={() => approveEvent(event)}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl"
                      >
                        Approve
                      </button>
                    )}

                  <button
                    onClick={() => setEditEvent(event)}
                    className="border px-3 py-1 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setViewRegs(event)}
                    className="border px-3 py-1 rounded-lg text-blue-600"
                  >
                    Registrations
                  </button>

                  <button
                    onClick={() => setDeleteEvent(event)}
                    className="border px-3 py-1 rounded-lg text-red-600"
                  >
                    Delete
                  </button>

                  {status === "live" && (
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl"
                    >
                      Member Check-In
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold">Events Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage cafe events</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportEvents}
            className="border px-5 py-3 rounded-2xl"
          >
            Export
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl shadow"
          >
            + Create Event
          </button>
        </div>
      </div>

      {renderSection(
        "📝 Draft Events",
        "draft",
        "bg-yellow-100 text-yellow-700",
      )}
      {renderSection("🔴 Live Events", "live", "bg-green-100 text-green-700")}
      {renderSection(
        "🟡 Upcoming Events",
        "upcoming",
        "bg-blue-100 text-blue-700",
      )}
      {renderSection(
        "⚫ Completed Events",
        "completed",
        "bg-gray-200 text-gray-700",
      )}

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
