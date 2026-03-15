import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import OrderBoard from "../../features/orders/OrderBoard";
import CreateOrderModal from "../../features/orders/createOrder/CreateOrder";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    // Real-time orders listener
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      setOrders(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });
    // Real-time customers listener
    const unsubscribeCustomers = onSnapshot(
      collection(db, "customers"),
      (snapshot) => {
        setCustomers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      },
    );
    return () => {
      unsubscribeOrders();
      unsubscribeCustomers();
    };
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Orders Board</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm"
        >
          + Create Order
        </button>
      </div>
      <OrderBoard orders={orders} customers={customers} />
      {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
