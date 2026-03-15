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
import AlertMessage from "../../../components/common/AlertMessage";
import { db } from "../../../firebase/firebase";

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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  /* MENU + CUSTOMERS */

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

  /* VALIDATIONS */

  const validateCustomer = () => {
    if (!isNewCustomer) {
      if (!selectedCustomerId) {
        setError("Please select a customer");
        return false;
      }

      return true;
    }

    if (!newCustomer.name || !newCustomer.phone) {
      setError("Customer name and phone required");
      return false;
    }

    const phone = newCustomer.phone.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Enter valid 10 digit phone number");
      return false;
    }

    const existing = customers.find((c) => c.phone === phone);

    if (existing) {
      setError(
        `Customer already exists: ${existing.name}. Please select from list.`,
      );
      return false;
    }

    return true;
  };

  const validateCart = () => {
    if (cart.length === 0) {
      setError("Cart is empty. Please add items before creating order.");
      return false;
    }

    return true;
  };

  /* CREATE ORDER */

  const handleCreateOrder = async () => {
    setError("");

    if (!validateCustomer()) return;
    if (!validateCart()) return;

    setLoading(true);

    try {
      let customerId = selectedCustomerId;
      let customerData = null;

      if (isNewCustomer) {
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

      setSuccess("Order created successfully");

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error(err);
      setError("Failed to create order");
    }

    setLoading(false);
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

        <AlertMessage
          message={error}
          type="error"
          onClose={() => setError("")}
        />

        <AlertMessage
          message={success}
          type="success"
          onClose={() => setSuccess("")}
        />

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
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
