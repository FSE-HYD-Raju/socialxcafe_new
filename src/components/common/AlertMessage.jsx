import { useEffect } from "react";

export default function AlertMessage({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  const styles = {
    success: "bg-green-100 border-green-400 text-green-800",
    error: "bg-red-100 border-red-400 text-red-800",
    info: "bg-blue-100 border-blue-400 text-blue-800",
  };

  return (
    <div className="fixed top-6 right-6 z-[999]">
      <div className={`px-6 py-3 rounded-lg border shadow-md ${styles[type]}`}>
        <div className="flex items-center gap-4">
          <span className="text-sm">{message}</span>

          <button onClick={onClose} className="text-xs font-semibold">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
