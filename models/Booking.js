import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    requirements: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["Pending", "In Progress", "Completed"], 
      default: "Pending" 
    },
    // 👇 পেমেন্ট সিস্টেমের জন্য এই দুটো ফিল্ড অবশ্যই লাগবে
    transactionId: { type: String, default: "" },
    paymentStatus: { 
      type: String, 
      enum: ["Unpaid", "Pending Verification", "Paid"], 
      default: "Unpaid" 
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;