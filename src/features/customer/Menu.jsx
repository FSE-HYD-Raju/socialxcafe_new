import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../features/admin/context/CartContext";
import { db } from "../../firebase/firebase";

export default function Menu() {
  const [items, setItems] = useState([]);
  const { addToCart } = useCart();
  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(collection(db, "menuItems"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.isAvailable);
      setItems(data);
    };
    fetchMenu();
  }, []);

  return (
    <section className="py-24 px-6 bg-section min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-heading mb-12">Our Menu</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm"
            >
              <h3 className="font-heading text-xl mb-2">{item.name}</h3>
              <p className="text-muted text-sm mb-4">{item.category}</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">₹{item.price}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="px-4 py-2 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <p className="text-muted mt-8">No items available.</p>
        )}
      </div>
    </section>
  );
}
