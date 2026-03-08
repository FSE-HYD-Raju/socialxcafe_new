import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { X } from "lucide-react";
import CustomerSection from "./CustomerSection";
import MenuSection from "./MenuSection";
import CartSection from "./CartSection";
import { db } from "../../../lib/firebase";

export default function CreateOrderModal({ onClose }) {
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
  });
  const [cart, setCart] = useState([]);
  useEffect(() => {
    const unsubMenu = onSnapshot(collection(db, "menuItems"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        active: doc.data().active === undefined ? true : doc.data().active,
      }));
      setMenuItems(items.filter((i) => i.active));
    });
    const unsubCustomers = onSnapshot(
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
      unsubMenu();
      unsubCustomers();
    };
  }, []);

  const handleCreateOrder = async () => {
    let customerId = selectedCustomerId;
    let customerData = null;
    if (isNewCustomer) {
      if (!newCustomer.name || !newCustomer.phone) {
        alert("Name & phone required");
        return;
      }
      const docRef = await addDoc(collection(db, "customers"), {
        ...newCustomer,
        walletBalance: 0,
        createdAt: serverTimestamp(),
      });
      customerId = docRef.id;
      customerData = newCustomer;
    } else {
      customerData = customers.find((c) => c.id === selectedCustomerId);
    }
    if (!customerId || !customerData) {
      alert("Select customer");
      return;
    }
    const total = cart.reduce(
      (sum, item) =>
        sum +
        (item.isService ? item.price * item.duration : item.price * item.qty),
      0,
    );
    await addDoc(collection(db, "orders"), {
      customerId,
      customerName: customerData.name,
      customerPhone: customerData.phone,
      items: cart,
      totalAmount: Math.round(total),
      status: "draft",
      createdAt: serverTimestamp(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[95%] max-w-6xl rounded-3xl shadow-xl p-8 relative overflow-y-auto max-h-[92vh]">
        <button onClick={onClose} className="absolute top-6 right-6">
          <X size={22} />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-primary">
          Create Order
        </h2>
        <CustomerSection
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          isNewCustomer={isNewCustomer}
          setIsNewCustomer={setIsNewCustomer}
          newCustomer={newCustomer}
          setNewCustomer={setNewCustomer}
        />
        <div className="grid md:grid-cols-3 gap-8 mt-6">
          <MenuSection menuItems={menuItems} cart={cart} setCart={setCart} />
          <CartSection
            cart={cart}
            setCart={setCart}
            onCreate={handleCreateOrder}
          />
        </div>
      </div>
    </div>
  );
}
