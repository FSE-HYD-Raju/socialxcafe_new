import { useState } from "react";
import { db } from "../../firebase/firebase";
import {
  addDoc,
  updateDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  FOOD_CATEGORIES,
  SERVICE_CATEGORIES,
} from "../../constants/menuCategories";

export default function MenuFormModal({ item, tab, onClose }) {
  const categories = tab === "food" ? FOOD_CATEGORIES : SERVICE_CATEGORIES;
  const [form, setForm] = useState({
    name: item?.name || "",
    category: item?.category || categories[0],
    description: item?.description || "",
    price: item?.price || "",
    isService: tab === "services",
    serviceUnit: item?.serviceUnit || "hour",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert("Name & price required");
      return;
    }

    if (item) {
      await updateDoc(doc(db, "menuItems", item.id), form);
    } else {
      await addDoc(
        collection(db, "menuItems"),

        {
          ...form,
          active: true,
          createdAt: serverTimestamp(),
        },
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[420px]">
        <h2 className="text-xl font-semibold mb-6">
          {item ? "Edit Item" : "Add Item"}
        </h2>
        <div className="space-y-4">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="border px-4 py-2 rounded-xl w-full"
          />
          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
            className="border px-4 py-2 rounded-xl w-full"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: Number(e.target.value),
              })
            }
            className="border px-4 py-2 rounded-xl w-full"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="border px-4 py-2 rounded-xl w-full"
          />
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-4 py-2 rounded-xl flex-1"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-xl flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
