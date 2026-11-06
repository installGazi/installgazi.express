import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";

// ১. নতুন বুকিং তৈরি করা
export const createBooking = asyncHandler(async (req, res) => {
  const { planName, price, requirements } = req.body;

  if (!planName || !price || !requirements) {
    res.status(400);
    throw new Error("Please provide all details");
  }

  const booking = await Booking.create({
    user: req.user._id,
    planName,
    price,
    requirements,
  });

  res.status(201).json(booking);
});

// ২. নিজের বুকিংগুলো দেখা
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(bookings);
});

// ৩. সব বুকিং দেখা (অ্যাডমিন)
export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate("user", "name email profilePic")
    .sort({ createdAt: -1 });
  res.status(200).json(bookings);
});

// ৪. বুকিং ও পেমেন্ট স্ট্যাটাস আপডেট (অ্যাডমিন)
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (status) booking.status = status;
  if (paymentStatus) booking.paymentStatus = paymentStatus;

  const updatedBooking = await booking.save();
  res.status(200).json(updatedBooking);
});

// ৫. পেমেন্ট সাবমিট করা (ক্লায়েন্ট)
export const submitPayment = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const bookingId = req.params.id;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to pay for this booking");
  }

  booking.transactionId = transactionId;
  booking.paymentStatus = "Pending Verification";
  await booking.save();

  res.status(200).json({ message: "Payment submitted for verification", booking });
});