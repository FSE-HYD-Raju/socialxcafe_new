import OrderCard from "./OrderCard";

export default function OrderColumn({
  title,
  orders,
  action,
  actionLabel,
  hideAction,
  bg,
  headerColor,
}) {
  return (
    <div className={`${bg} rounded-2xl shadow-inner border`}>
      {/* Header */}
      <div className={`${headerColor} px-4 py-3 rounded-t-2xl`}>
        <h2 className="font-semibold text-sm">
          {title} ({orders.length})
        </h2>
      </div>
      {/* Content */}
      <div className="p-4 space-y-4 min-h-[300px]">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            action={action}
            actionLabel={actionLabel}
            hideAction={hideAction}
          />
        ))}
        {orders.length === 0 && (
          <p className="text-xs text-gray-400">No orders</p>
        )}
      </div>
    </div>
  );
}
