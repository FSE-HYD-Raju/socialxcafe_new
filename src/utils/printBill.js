export default function printBill(order) {
  const date = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleString()
    : new Date().toLocaleString();

  const cgst = Math.round((order.taxAmount || 0) / 2);
  const sgst = Math.round((order.taxAmount || 0) / 2);

  /* -------- COMBINE FOOD ITEMS -------- */

  const foodMap = {};

  const serviceItems = [];

  order.items?.forEach((item) => {
    if (item.isService) {
      serviceItems.push(item);
      return;
    }

    if (!foodMap[item.name]) {
      foodMap[item.name] = { ...item };
    } else {
      foodMap[item.name].qty += item.qty;
    }
  });

  const foodItems = Object.values(foodMap);

  /* -------- BUILD HTML -------- */

  const foodHtml = foodItems
    .map(
      (item) => `
<div style="display:flex;justify-content:space-between;font-size:12px">
<span>${item.name} ${item.qty} x ₹${item.price}</span>
<span>₹${item.qty * item.price}</span>
</div>`,
    )
    .join("");

  const serviceHtml = serviceItems
    .map(
      (item) => `
<div style="display:flex;justify-content:space-between;font-size:12px">
<span>${item.name}</span>
<span>₹${item.actualAmount || 0}</span>
</div>`,
    )
    .join("");

  const html = `
<html>
<body style="font-family:monospace;width:280px;padding:15px">

<h2 style="text-align:center">SOCIALX CAFE</h2>

<hr/>

<div style="display:flex;justify-content:space-between">
<span>Customer</span>
<span>${order.customerName || "Walk-in"}</span>
</div>

<div style="display:flex;justify-content:space-between">
<span>Date</span>
<span>${date}</span>
</div>

<hr/>

${foodHtml}

${serviceHtml}

<hr/>

<div style="display:flex;justify-content:space-between">
<span>Subtotal</span>
<span>₹${order.subTotal || order.totalAmount}</span>
</div>

<div style="display:flex;justify-content:space-between">
<span>CGST</span>
<span>₹${cgst}</span>
</div>

<div style="display:flex;justify-content:space-between">
<span>SGST</span>
<span>₹${sgst}</span>
</div>

<hr/>

<div style="display:flex;justify-content:space-between;font-weight:bold">
<span>Total</span>
<span>₹${order.totalAmount}</span>
</div>

<hr/>

<div style="text-align:center;font-size:11px">
Thank you! Visit again.
</div>

</body>
</html>
`;

  const win = window.open("", "_blank");

  win.document.write(html);
  win.document.close();

  setTimeout(() => {
    win.print();
    win.close();
  }, 300);
}
