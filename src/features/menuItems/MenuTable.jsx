import { useState, useMemo } from "react";
import { db } from "../../firebase/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function MenuTable({ items, onEdit }) {
  const [search, setSearch] = useState("");
  const groupedItems = useMemo(() => {
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
    const sorted = filtered.sort((a, b) =>
      a.category.localeCompare(b.category),
    );
    return sorted.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [items, search]);
  const toggleActive = async (item) => {
    await updateDoc(doc(db, "menuItems", item.id), {
      active: !item.active,
    });
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteDoc(doc(db, "menuItems", id));
  };
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <input
        placeholder="Search menu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-4 py-2 rounded-xl w-full mb-6"
      />
      <div className="space-y-8">
        {Object.keys(groupedItems)
          .sort()
          .map((category) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                {category}
              </h3>
              <div className="space-y-3">
                {groupedItems[category].map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border p-4 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        ₹{item.price}
                        {item.isService && " / hour"}
                      </div>
                    </div>
                    <div className="flex gap-3 items-center text-sm">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs ${
                          item.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => toggleActive(item)}
                        className="px-3 py-1 bg-yellow-100 rounded-lg"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="px-3 py-1 bg-blue-100 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-100 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        {Object.keys(groupedItems).length === 0 && (
          <p className="text-sm text-gray-400">No items found</p>
        )}
      </div>
    </div>
  );
}
