import { Trash2 } from "lucide-react";

export default function CartSection({
  cart,

  setCart,

  onCreate,
}) {
  const updateQty = (id, delta) => {
    setCart(
      cart

        .map((item) =>
          item.id === id
            ? {
                ...item,

                qty: (item.qty || 1) + delta,
              }
            : item,
        )

        .filter((item) => (item.isService ? true : item.qty > 0)),
    );
  };

  const updateDuration = (id, value) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,

              duration: Number(value),
            }
          : item,
      ),
    );
  };

  const total = cart.reduce(
    (sum, item) =>
      sum +
      (item.isService ? item.price * item.duration : item.price * item.qty),

    0,
  );

  return (
    <div className="sticky top-8 self-start bg-gray-50 p-6 rounded-2xl shadow-sm">
      <h3 className="font-semibold mb-5 text-lg">Order Summary</h3>

      {cart.length === 0 && (
        <div className="text-gray-400 text-sm">Cart is empty</div>
      )}

      {cart.map((item) => (
        <div key={item.id} className="border-b py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500">
                ₹{item.price}
                {item.isService && " / hr"}
              </div>
            </div>
            <Trash2
              size={16}
              className="text-red-500 cursor-pointer"
              onClick={() => setCart(cart.filter((c) => c.id !== item.id))}
            />
          </div>

          {!item.isService && (
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() =>
                  updateQty(
                    item.id,

                    -1,
                  )
                }
                className="px-3 py-1 bg-gray-200 rounded-lg"
              >
                -
              </button>
              <span>{item.qty}</span>
              <button
                onClick={() =>
                  updateQty(
                    item.id,

                    1,
                  )
                }
                className="px-3 py-1 bg-gray-200 rounded-lg"
              >
                +
              </button>
              <div className="ml-auto font-medium">
                ₹{item.price * item.qty}
              </div>
            </div>
          )}

          {item.isService && (
            <div className="mt-3">
              <input
                type="number"
                value={item.duration}
                onChange={(e) =>
                  updateDuration(
                    item.id,

                    e.target.value,
                  )
                }
                className="border px-3 py-2 rounded-xl w-full text-sm"
              />
              <div className="mt-2 text-right font-medium">
                ₹{item.price * item.duration}
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="mt-6 text-lg font-semibold flex justify-between">
        <span>Total</span>
        <span>₹{Math.round(total)}</span>
      </div>
      <button
        onClick={onCreate}
        className="mt-6 bg-primary text-white px-4 py-3 rounded-xl w-full"
      >
        Create Order
      </button>
    </div>
  );
}
