// Convert "HH:mm" string → Date
export function parseTime(time) {
  if (!time) return null;

  // Already a Date (from DatePicker)
  if (time instanceof Date) return time;

  // Firestore saved string
  if (typeof time === "string") {
    const parts = time.split(":");
    if (parts.length < 2) return null;

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  }

  return null;
}

// Convert Date → "HH:mm"
export function formatTime(date) {
  if (!date) return null;

  if (!(date instanceof Date)) return date;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// Convert Firestore timestamp safely
export function parseFirestoreDate(value) {
  if (!value) return null;

  // Firestore Timestamp
  if (value?.toDate) {
    const d = value.toDate();
    return isNaN(d.getTime()) ? null : d;
  }

  // Timestamp object {seconds,nanoseconds}
  if (value?.seconds) {
    const d = new Date(value.seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }

  // Already Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // String date
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function parseFirestoreTime(timestamp) {
  if (!timestamp) return null;

  let d;

  if (timestamp?.toDate) {
    d = timestamp.toDate();
  } else if (timestamp?.seconds) {
    d = new Date(timestamp.seconds * 1000);
  } else {
    d = new Date(timestamp);
  }

  if (isNaN(d.getTime())) return null;

  // Create a fresh date and only copy time
  const time = new Date();
  time.setHours(d.getHours());
  time.setMinutes(d.getMinutes());
  time.setSeconds(0);
  time.setMilliseconds(0);

  return time;
}

// Display date for UI
export function formatDisplayDate(date) {
  if (!date) return "";

  if (!(date instanceof Date)) {
    date = parseFirestoreDate(date);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Display time for UI
export function formatDisplayTime(time) {
  if (!time) return "";

  if (typeof time === "string") {
    const parsed = parseTime(time);
    if (!parsed) return "";
    time = parsed;
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "numeric",
  }).format(time);
}
