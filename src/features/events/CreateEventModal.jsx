import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { db, auth } from "../../firebase/firebase";
import slugify from "../../utils/slugify";

import AlertMessage from "../../components/common/AlertMessage";
import { formatTime } from "../../utils/dateTime";

export default function CreatePublicEventModal({ onClose }) {
  const admin = JSON.parse(localStorage.getItem("user"));
  const [alert, setAlert] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "Comedy",
    description: "",
    artistNames: "",
    language: "",
    duration: "",
    ageLimit: "",

    eventDate: null,
    startTime: null,
    endTime: null,

    venue: "",
    location: "",

    price: "",
    capacity: "",

    tags: [],

    organizerName: "",
    organizerPhone: "",
    organizerEmail: "",

    registrationDeadline: null,
    status: "draft",

    terms: "",
  });

  const update = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const addTag = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!tagInput.trim()) return;

      setForm({
        ...form,
        tags: [...form.tags, tagInput.trim()],
      });

      setTagInput("");
    }
  };

  const removeTag = (index) => {
    const updated = [...form.tags];
    updated.splice(index, 1);
    setForm({ ...form, tags: updated });
  };

  const createOrganizer = async () => {
    // If logged-in user is organizer → use their UID
    if (admin.role === "eventOrganizer") {
      return admin.uid;
    }

    // Admin creating organizer account
    if (!form.organizerEmail) return null;

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.organizerEmail,
        "Temp@123456",
      );

      return cred.user.uid;
    } catch (err) {
      // If email already exists we still proceed
      if (err.code === "auth/email-already-in-use") {
        return null;
      }

      return null;
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.eventDate) {
      setAlert({
        message: "Event title and date are required",
        type: "error",
      });
      return;
    }

    try {
      const slug = slugify(form.title);

      const organizerId = await createOrganizer();

      if (form.startTime && form.endTime && form.endTime <= form.startTime) {
        setAlert({
          message: "End time must be after start time",
          type: "error",
        });
        return;
      }

      await addDoc(collection(db, "events"), {
        ...form,
        slug,

        startTime: formatTime(form.startTime),
        endTime: formatTime(form.endTime),

        eventDate: form.eventDate,

        price: Number(form.price || 0),
        capacity: Number(form.capacity || 0),

        organizerId,

        createdBy: admin.uid,
        updatedBy: admin.uid,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        registeredCount: 0,
        status: "draft",
      });

      setAlert({
        message: "Event created successfully",
        type: "success",
      });

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setAlert({
        message: "Failed to create event",
        type: "error",
      });
    }
  };

  return (
    <>
      <AlertMessage
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({})}
      />

      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-[900px] max-h-[90vh] overflow-y-auto p-8">
          <h2 className="text-2xl font-semibold mb-6">Create Event</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Event Title">
              <input
                className="input"
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>

            <Field label="Category">
              <select
                className="input"
                onChange={(e) => update("category", e.target.value)}
              >
                <option>Comedy</option>
                <option>Music</option>
                <option>Workshop</option>
                <option>Community</option>
              </select>
            </Field>

            <Field label="Artist Names">
              <input
                placeholder="Rahul Subramanian, Kunal Kamra"
                className="input"
                onChange={(e) => update("artistNames", e.target.value)}
              />
            </Field>

            <Field label="Language">
              <input
                className="input"
                placeholder="Hindi, English"
                onChange={(e) => update("language", e.target.value)}
              />
            </Field>

            <Field label="Duration">
              <input
                className="input"
                placeholder="1h 30m"
                onChange={(e) => update("duration", e.target.value)}
              />
            </Field>

            <Field label="Age Limit">
              <input
                className="input"
                placeholder="16+"
                onChange={(e) => update("ageLimit", e.target.value)}
              />
            </Field>

            <Field label="Event Date">
              <DatePicker
                selected={form.eventDate}
                onChange={(date) => update("eventDate", date)}
                className="input w-full"
                wrapperClassName="w-full"
                dateFormat="dd MMM yyyy"
              />
            </Field>

            <Field label="Start Time">
              <DatePicker
                selected={form.startTime}
                onChange={(time) => update("startTime", time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                dateFormat="h:mm aa"
                className="input w-full"
                wrapperClassName="w-full"
              />
            </Field>

            <Field label="End Time">
              <DatePicker
                selected={form.endTime}
                onChange={(time) => update("endTime", time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                dateFormat="h:mm aa"
                className="input w-full"
                wrapperClassName="w-full"
              />
            </Field>

            <Field label="Venue">
              <input
                className="input"
                onChange={(e) => update("venue", e.target.value)}
              />
            </Field>

            <Field label="Location">
              <input
                className="input"
                onChange={(e) => update("location", e.target.value)}
              />
            </Field>

            <Field label="Price">
              <input
                type="number"
                className="input"
                onChange={(e) => update("price", e.target.value)}
              />
            </Field>

            <Field label="Capacity">
              <input
                type="number"
                className="input"
                onChange={(e) => update("capacity", e.target.value)}
              />
            </Field>

            <Field label="Tags">
              <div className="border rounded-lg p-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.tags.map((tag, i) => (
                    <span
                      key={i}
                      onClick={() => removeTag(i)}
                      className="bg-gray-200 text-xs px-3 py-1 rounded-full cursor-pointer"
                    >
                      {tag} ✕
                    </span>
                  ))}
                </div>

                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Press Enter to add"
                  className="w-full outline-none"
                />
              </div>
            </Field>

            {admin.role !== "eventOrganizer" && (
              <>
                <Field label="Organizer Name">
                  <input
                    className="input"
                    onChange={(e) => update("organizerName", e.target.value)}
                  />
                </Field>

                <Field label="Organizer Phone">
                  <input
                    className="input"
                    onChange={(e) => update("organizerPhone", e.target.value)}
                  />
                </Field>

                <Field label="Organizer Email">
                  <input
                    className="input"
                    onChange={(e) => update("organizerEmail", e.target.value)}
                  />
                </Field>
              </>
            )}
          </div>

          <Field label="About Event" className="mt-6">
            <textarea
              rows="4"
              className="input"
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>

          <Field label="Terms & Conditions">
            <textarea
              rows="3"
              className="input"
              onChange={(e) => update("terms", e.target.value)}
            />
          </Field>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSubmit}
              className="bg-primary text-white px-6 py-3 rounded-xl flex-1"
            >
              Create Event
            </button>

            <button
              onClick={onClose}
              className="border px-6 py-3 rounded-xl flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
