import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function OrderCard({ order, action, actionLabel, hideAction }) {
  const [elapsed, setElapsed] = useState("");
  const foodItems = order.items?.filter((i) => !i.isService) || [];
  const serviceItems = order.items?.filter((i) => i.isService) || [];
  useEffect(() => {
    if (order.status !== "in_progress" || !order.startedAt) return;
    const getStartTime = () => {
      if (order.startedAt.toDate) return order.startedAt.toDate().getTime();
      if (order.startedAt.seconds) return order.startedAt.seconds * 1000;
      return null;
    };
    const startTime = getStartTime();
    if (!startTime) return;
    const interval = setInterval(() => {
      const diff = Date.now() - startTime;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsed(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const printBill = (order) => {
    const date = order.createdAt?.seconds
      ? new Date(order.createdAt.seconds * 1000).toLocaleString()
      : new Date().toLocaleString();
    const itemsHtml = order.items
      ?.map((item) => {
        const qty = item.qty || 1;
        const price = item.isService ? item.actualAmount : item.price;
        return `
<div style="display:flex;justify-content:space-between;font-size:12px">
<span>${item.name} x${qty}</span>
<span>₹${price}</span>
</div>
     `;
      })
      .join("");
    const html = `
<html>
<head>
<title>Bill</title>
<style>
       body {
         font-family: monospace;
         width: 300px;
         padding: 20px;
       }
       h2 {
         text-align:center;
       }
       hr {
         border:none;
         border-top:1px dashed #ccc;
       }
</style>
</head>
<body>
<h2>SOCIALX CAFE</h2>
<hr/>
<div>Customer: ${order.customerName || "Walk-in"}</div>
<div>${date}</div>
<hr/>
     ${itemsHtml}
<hr/>
<div style="display:flex;justify-content:space-between;font-weight:bold">
<span>Total</span>
<span>₹${order.totalAmount}</span>
</div>
<hr/>
<div style="text-align:center;font-size:12px">
       Thank you! Visit again.
</div>
</body>
</html>
 `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-5 rounded-2xl shadow-sm border text-sm flex flex-col"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-base">
            {order.customerName || "Walk-in"}
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {order.status}
          </div>
        </div>
        {/* TOTAL */}
        <div className="text-primary font-semibold text-sm mb-3">
          ₹{order.totalAmount}
        </div>
        {/* SERVICE TIMER */}
        {order.status === "in_progress" && serviceItems.length > 0 && (
          <div className="bg-red-50 text-red-600 text-xs font-medium px-3 py-2 rounded-lg mb-3 flex justify-between items-center">
            <span>⏱ Service Running</span>
            <span>{elapsed || "Starting..."}</span>
          </div>
        )}
        {/* FOOD ITEMS */}
        {foodItems.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">Food</div>
            <div className="space-y-1">
              {foodItems.map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{item.name}</span>
                  <span>x{item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* SERVICES */}
        {serviceItems.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">Services</div>
            <div className="space-y-2">
              {serviceItems.map((item, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    {order.status === "in_progress" && (
                      <span className="text-blue-600">running</span>
                    )}
                  </div>
                  {order.status === "completed" && item.actualDuration && (
                    <div className="text-green-600 text-xs mt-1">
                      {item.actualDuration.toFixed(2)} hrs → ₹
                      {item.actualAmount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ACTION BUTTON */}
        {!hideAction && (
          <button
            onClick={() => action(order)}
            className="mt-auto w-full text-xs bg-primary text-white py-2 rounded-xl hover:opacity-90 transition"
          >
            {actionLabel}
          </button>
        )}
        {/* PRINT BUTTON */}
        <button
          onClick={() => printBill(order)}
          className="w-full border text-xs py-2 rounded-lg mt-2 hover:bg-gray-50"
        >
          🧾 Print Bill
        </button>
      </motion.div>
    </>
  );
}
