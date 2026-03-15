import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { parseFirestoreDate, parseTime } from "./dateTime";

export function calculateEventStatus(event) {
  if (!event.eventDate) return event.status;

  const baseDate = parseFirestoreDate(event.eventDate);
  if (!baseDate) return event.status;

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

  if (now >= start && now <= end) return "live";
  if (now > end) return "completed";

  return "upcoming";
}

export async function updateEventStatusIfNeeded(event) {
  if (!event || event.status === "draft") return;

  const newStatus = calculateEventStatus(event);

  if (newStatus !== event.status) {
    await updateDoc(doc(db, "events", event.id), {
      status: newStatus,
    });
  }
}
