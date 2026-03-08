import { useMemo, useState } from "react";
export default function MenuSection({ menuItems, cart, setCart }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("food");
  const filtered = useMemo(() => {
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [menuItems, search]);
  const displayedItems =
    activeTab === "food"
      ? filtered.filter((i) => !i.isService)
      : filtered.filter((i) => i.isService);
  const addToCart = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id
            ? {
                ...c,
                qty: (c.qty || 1) + 1,
              }
            : c,
        ),
      );
    } else {
      setCart([
        ...cart,
        item.isService ? { ...item, duration: 1 } : { ...item, qty: 1 },
      ]);
    }
  };
  return (
    <div className="md:col-span-2">
      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("food")}
          className={`px-5 py-2 rounded-xl font-medium ${
            activeTab === "food" ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
        >
          Food & Beverages
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-5 py-2 rounded-xl font-medium ${
            activeTab === "services"
              ? "bg-orange-500 text-white"
              : "bg-gray-100"
          }`}
        >
          Services
        </button>
      </div>
      {/* Search */}
      <input
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-4 py-3 rounded-xl w-full mb-6"
      />
      {/* Items */}
      <div className="grid md:grid-cols-2 gap-4">
        {displayedItems.map((item) => (
          <div
            key={item.id}
            onClick={() => addToCart(item)}
            className="border p-4 rounded-2xl cursor-pointer hover:shadow-md transition"
          >
            <div className="font-medium">{item.name}</div>
            {item.description && (
              <div className="text-xs text-gray-500 mt-1">
                {item.description}
              </div>
            )}
            <div className="text-sm mt-2 font-semibold">
              ₹{item.price}
              {item.isService && " / hour"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
