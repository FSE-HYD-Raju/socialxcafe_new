import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Trash2 } from "lucide-react";
import ConfirmDeleteModal from "../../components/common/DeleteCofirmation";
import printBill from "../../utils/printBill";
import ConfirmModal from "../../components/common/Confirmation";

export default function OrderCard({ order, action, actionLabel, hideAction }) {
  const [timers, setTimers] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [endIndex, setEndIndex] = useState(null);

  const TAX_PERCENT = 5;

  /* ---------- MERGE FOOD ITEMS ---------- */

  const foodMap = {};

  order.items?.forEach((item) => {
    if (item.isService) return;

    if (!foodMap[item.name]) foodMap[item.name] = { ...item };
    else foodMap[item.name].qty += item.qty;
  });

  const foodItems = Object.values(foodMap);
  const serviceItems = order.items?.filter((i) => i.isService) || [];

  /* ---------- START TIME HELPER ---------- */

  const getStartTime = (item) => {
    if (!item.startedAt) return null;

    if (item.startedAt.seconds) return item.startedAt.seconds * 1000;

    return new Date(item.startedAt).getTime();
  };

  /* ---------- TIMER DISPLAY ---------- */

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};

      order.items?.forEach((item, index) => {
        if (!item.isService) return;
        if (item.serviceStatus !== "running") return;

        const start = getStartTime(item);
        if (!start) return;

        const paused = item.pausedDuration || 0;

        const diff = Date.now() - start - paused;

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        updated[index] = `${minutes}m ${seconds}s`;
      });

      setTimers(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.items]);

  /* ---------- SERVICE CONTROL ---------- */

  const updateService = async (index, type) => {
    const items = [...order.items];
    const item = items[index];

    if (type === "start") {
      item.serviceStatus = "running";
      item.startedAt = new Date();
      item.pausedDuration = 0;
      item.pausedAt = null;
    }

    if (type === "pause") {
      item.serviceStatus = "paused";
      item.pausedAt = new Date();
    }

    if (type === "resume") {
      const pauseStart = new Date(item.pausedAt).getTime();

      const pausedTime = Date.now() - pauseStart;

      item.pausedDuration = (item.pausedDuration || 0) + pausedTime;

      item.serviceStatus = "running";
      item.pausedAt = null;
    }

    await updateDoc(doc(db, "orders", order.id), { items });
  };

  /* ---------- END GAME ---------- */

  const confirmEnd = async () => {
    const items = [...order.items];
    const item = items[endIndex];

    const start = getStartTime(item);
    const paused = item.pausedDuration || 0;

    let diff = Date.now() - start - paused;

    if (diff < 0) diff = 0;

    const minutes = Math.floor(diff / 60000);

    /* ---------- BILLING RULE ---------- */

    let blocks = 0;

    if (minutes >= 15) {
      blocks = Math.ceil((minutes - 15) / 15) + 1;
    }

    const rate = item.price || 0;

    item.serviceStatus = "ended";
    item.actualDuration = minutes;
    item.actualAmount = blocks * rate;

    /* ---------- RECALCULATE ORDER ---------- */

    let subtotal = 0;

    items.forEach((i) => {
      if (i.isService) subtotal += i.actualAmount || 0;
      else subtotal += i.price * i.qty;
    });

    const tax = Math.round((subtotal * TAX_PERCENT) / 100);
    const total = subtotal + tax;

    await updateDoc(doc(db, "orders", order.id), {
      items,
      subTotal: subtotal,
      taxAmount: tax,
      totalAmount: total,
    });

    setEndIndex(null);
  };

  /* ---------- DELETE ORDER ---------- */

  const deleteOrder = async () => {
    await deleteDoc(doc(db, "orders", order.id));
    setDeleteModal(false);
  };

  return (
    <>
      {deleteModal && (
        <ConfirmDeleteModal
          title="Delete Order"
          message="Are you sure you want to delete this order?"
          onConfirm={deleteOrder}
          onCancel={() => setDeleteModal(false)}
        />
      )}

      {endIndex !== null && (
        <ConfirmModal
          confirmButtonText="End Game"
          title="End Game"
          message="This will end the game and calculate final amount."
          onConfirm={confirmEnd}
          onCancel={() => setEndIndex(null)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white p-5 rounded-2xl shadow-sm border text-sm flex flex-col"
      >
        {/* HEADER */}

        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold">{order.customerName || "Walk-in"}</div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 capitalize">
              {order.status}
            </span>

            <Trash2
              size={16}
              className="text-red-500 cursor-pointer"
              onClick={() => setDeleteModal(true)}
            />
          </div>
        </div>

        {/* TOTAL */}

        <div className="text-primary font-semibold mb-3">
          ₹{order.totalAmount}
        </div>

        {/* FOOD */}

        {foodItems.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">Food</div>

            {foodItems.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{item.name}</span>
                <span>
                  {item.qty} x ₹{item.price}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* SERVICES */}

        {serviceItems.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">Services</div>

            {order.items.map((item, i) => {
              if (!item.isService) return null;

              return (
                <div key={i} className="bg-gray-50 rounded-lg p-2 mb-2">
                  <div className="flex justify-between text-xs">
                    <span>{item.name}</span>

                    {item.serviceStatus === "running" && (
                      <span className="text-red-600">
                        ⏱ {timers[i] || "0m 0s"}
                      </span>
                    )}

                    {item.serviceStatus === "paused" && (
                      <span className="text-yellow-600">Paused</span>
                    )}

                    {item.serviceStatus === "ended" && (
                      <span className="text-green-600">
                        ₹{item.actualAmount}
                      </span>
                    )}
                  </div>

                  {order.status === "in_progress" &&
                    item.serviceStatus !== "ended" && (
                      <div className="flex gap-2 mt-2">
                        {!item.serviceStatus && (
                          <button
                            onClick={() => updateService(i, "start")}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Start
                          </button>
                        )}

                        {item.serviceStatus === "running" && (
                          <>
                            <button
                              onClick={() => updateService(i, "pause")}
                              className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                            >
                              Pause
                            </button>

                            <button
                              onClick={() => setEndIndex(i)}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                            >
                              End
                            </button>
                          </>
                        )}

                        {item.serviceStatus === "paused" && (
                          <>
                            <button
                              onClick={() => updateService(i, "resume")}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Resume
                            </button>

                            <button
                              onClick={() => setEndIndex(i)}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                            >
                              End
                            </button>
                          </>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}

        {/* ACTION BUTTON */}

        {!hideAction && (
          <button
            onClick={() => action(order)}
            className="mt-auto w-full text-xs bg-primary text-white py-2 rounded-xl"
          >
            {actionLabel}
          </button>
        )}

        {/* PRINT */}

        {(order.status === "completed" || order.status === "paid") && (
          <button
            className="w-full border text-xs py-2 rounded-lg mt-2 hover:bg-gray-50"
            onClick={() => printBill(order)}
          >
            🧾 Print Bill
          </button>
        )}
      </motion.div>
    </>
  );
}
