import { useState, useMemo } from "react";
import OrderColumn from "./OrderColumn";
import PaymentModal from "./PaymentModal";
import { db } from "../../lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function OrderBoard({
  orders,
  customers,
  refresh,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("today");
  const calculateBilledHours = (diffMs) => {
    const totalMinutes = diffMs / (1000 * 60);
    const fullHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    if (remainingMinutes <= 10) {
      return fullHours;
    }
    return fullHours + remainingMinutes / 60;
  };

  const updateStatus = async (order, status) => {
    const data = { status };

    if (status === "in_progress") {
      data.startedAt = serverTimestamp();
    }

    if (status === "completed") {
      const now = new Date();
      data.completedAt = serverTimestamp();
      if (order.startedAt) {
        const start = order.startedAt.seconds * 1000;
        const diffMs = now.getTime() - start;
        const billedHours = calculateBilledHours(diffMs);
        let newTotal = 0;
        const updatedItems = order.items.map((item) => {
          if (item.isService) {
            const amount = item.price * billedHours;
            newTotal += amount;
            return {
              ...item,
              actualDuration: billedHours,
              actualAmount: Math.round(amount),
            };
          } else {
            const amount = item.price * item.qty;
            newTotal += amount;
            return item;
          }
        });

        data.items = updatedItems;
        data.totalAmount = Math.round(newTotal);
      }
    }

    await updateDoc(
      doc(db, "orders", order.id),
      data,
    );
    refresh();
  };

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt.seconds * 1000);
      if (filter === "today") {
        return orderDate.toDateString() === now.toDateString();
      }

      if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      }
      return true;
    });
  }, [orders, filter]);

  const grouped = {
    draft: filteredOrders.filter((o) => o.status === "draft"),
    in_progress: filteredOrders.filter((o) => o.status === "in_progress"),
    completed: filteredOrders.filter((o) => o.status === "completed"),
    paid: filteredOrders.filter((o) => o.status === "paid"),
  };

  const revenue = grouped.paid.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0,
  );

  return (
    <>
      {/* Revenue + Filter Bar */}
      <div className="bg-white border rounded-2xl p-6 mb-8 shadow-sm flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Revenue</p>
          <h2 className="text-2xl font-semibold">₹{revenue}</h2>
        </div>
        <div className="flex gap-3 text-sm">
          <button
            onClick={() => setFilter("today")}
            className={`px-3 py-1 rounded-lg ${
              filter === "today" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("week")}
            className={`px-3 py-1 rounded-lg ${
              filter === "week" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg ${
              filter === "all" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            All
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        <OrderColumn
          title="Draft"
          bg="bg-gray-100"
          headerColor="bg-gray-300"
          orders={grouped.draft}
          action={(o) =>
            updateStatus(
              o,
              "in_progress",
            )
          }
          actionLabel="Start"
        />
        <OrderColumn
          title="In Progress"
          bg="bg-yellow-50"
          headerColor="bg-yellow-200"
          orders={grouped.in_progress}
          action={(o) =>
            updateStatus(
              o,
              "completed",
            )
          }
          actionLabel="Complete"
        />
        <OrderColumn
          title="Completed"
          bg="bg-blue-50"
          headerColor="bg-blue-200"
          orders={grouped.completed}
          action={(o) => setSelectedOrder(o)}
          actionLabel="Pay"
        />
        <OrderColumn
          title="Paid"
          bg="bg-green-50"
          headerColor="bg-green-200"
          orders={grouped.paid}
          hideAction
        />
      </div>

      {selectedOrder && (
        <PaymentModal
          order={selectedOrder}
          customers={customers}
          onClose={() => setSelectedOrder(null)}
          refresh={refresh}
        />
      )}
    </>
  );
}
