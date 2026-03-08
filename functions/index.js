const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
admin.initializeApp();
exports.verifyRazorpayPayment = functions.https.onCall(
  async (data, context) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      userData,
    } = data;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", functions.config().razorpay.secret)
      .update(body.toString())
      .digest("hex");
    if (expectedSignature !== razorpay_signature) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid payment signature",
      );
    }
    const db = admin.firestore();
    const regRef = await db.collection("eventRegistrations").add({
      eventId,
      ...userData,
      paymentStatus: "Paid",
      paymentId: razorpay_payment_id,
      attended: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await db
      .collection("events")
      .doc(eventId)
      .update({
        registeredCount: admin.firestore.FieldValue.increment(1),
      });
    return {
      success: true,
      registrationId: regRef.id,
    };
  },
);
