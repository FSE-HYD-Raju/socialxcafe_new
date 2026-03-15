import { useEffect, useState, useMemo } from "react";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import MenuTable from "../../features/menuItems/MenuTable";
import MenuFormModal from "../../features/menuItems/MenuFormModal";

export default function Menu() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("food");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menuItems"), (snapshot) => {
      setItems(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });
    return () => unsubscribe();
  }, []);
  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      tab === "food" ? !item.isService : item.isService,
    );
  }, [items, tab]);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Menu Management</h1>
        <button
          onClick={() => {
            setEditItem(null);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm"
        >
          + Add Item
        </button>
      </div>
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("food")}
          className={`px-4 py-2 rounded-xl ${
            tab === "food" ? "bg-primary text-white" : "bg-gray-100"
          }`}
        >
          Food
        </button>
        <button
          onClick={() => setTab("services")}
          className={`px-4 py-2 rounded-xl ${
            tab === "services" ? "bg-primary text-white" : "bg-gray-100"
          }`}
        >
          Services
        </button>
      </div>
      <MenuTable
        items={filteredItems}
        onEdit={(item) => {
          setEditItem(item);
          setShowModal(true);
        }}
      />
      {showModal && (
        <MenuFormModal
          item={editItem}
          tab={tab}
          onClose={() => {
            setShowModal(false);
            setEditItem(null);
          }}
        />
      )}
    </div>
  );
}
