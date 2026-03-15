export default function CustomerSection({
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  isNewCustomer,
  setIsNewCustomer,
  newCustomer,
  setNewCustomer,
}) {
  return (
    <div className="bg-blue-50 p-6 rounded-2xl">
      <div className="flex gap-4 mb-5">
        <button
          onClick={() => setIsNewCustomer(false)}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            !isNewCustomer ? "bg-primary text-white" : "bg-white border"
          }`}
        >
          Existing Customer
        </button>
        <button
          onClick={() => setIsNewCustomer(true)}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            isNewCustomer ? "bg-primary text-white" : "bg-white border"
          }`}
        >
          New Customer
        </button>
      </div>
      {!isNewCustomer ? (
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="border px-4 py-3 rounded-xl w-full"
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.phone})
            </option>
          ))}
        </select>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <input
            placeholder="Name *"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({
                ...newCustomer,
                name: e.target.value,
              })
            }
            className="border px-4 py-3 rounded-xl"
          />
          <input
            placeholder="Phone *"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({
                ...newCustomer,
                phone: e.target.value,
              })
            }
            className="border px-4 py-3 rounded-xl"
          />
          <input
            placeholder="Email (optional)"
            value={newCustomer.email || ""}
            onChange={(e) =>
              setNewCustomer({
                ...newCustomer,
                email: e.target.value,
              })
            }
            className="border px-4 py-3 rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
