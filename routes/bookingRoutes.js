import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  submitPayment,
} from "../userControllers/bookingController.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.put("/:id/pay", protect, submitPayment);

// অ্যাডমিন রুট
router.get("/all", protect, adminMiddleware, getAllBookings);
router.put("/:id/status", protect, adminMiddleware, updateBookingStatus);

export default router;