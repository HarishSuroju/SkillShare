const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

/* ================= CREATE BOOKING ================= */
exports.createBooking = async (customerNumber, providerId, serviceType) => {

  const booking = new Booking({
    customerNumber,
    providerId,
    serviceType
  });

  await booking.save();
  return booking;
};

/* ================= ACCEPT BOOKING ================= */
exports.acceptBooking = async (bookingId) => {

  const booking = await Booking.findById(bookingId);
  if (!booking || booking.status !== "pending") return null;

  const now = new Date();
  const responseMinutes = (now - booking.bookingTime) / (1000 * 60);

  booking.status = "accepted";
  booking.responseTime = responseMinutes;
  await booking.save();

  // Update provider avg response time
  const provider = await Provider.findById(booking.providerId);
  const bookings = await Booking.find({
    providerId: provider._id,
    responseTime: { $exists: true }
  });

  const avg = bookings.reduce((sum, b) => sum + b.responseTime, 0) / bookings.length;
  provider.responseTimeAvg = avg;
  await provider.save();

  return booking;
};

/* ================= REJECT BOOKING ================= */
exports.rejectBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return null;

  booking.status = "cancelled";
  await booking.save();
  return booking;
};

/* ================= COMPLETE BOOKING ================= */
exports.completeBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return null;

  booking.status = "completed";
  await booking.save();
  return booking;
};

/* ================= RATE BOOKING ================= */
exports.rateBooking = async (bookingId, providerId, rating) => {

  const booking = await Booking.findById(bookingId);
  const provider = await Provider.findById(providerId);

  booking.rating = rating;
  await booking.save();

  const totalScore = provider.rating * provider.totalReviews + rating;
  provider.totalReviews += 1;
  provider.rating = totalScore / provider.totalReviews;

  const totalBookings = await Booking.countDocuments({ providerId });
  const completedBookings = await Booking.countDocuments({
    providerId,
    status: "completed"
  });

  provider.completionRate = completedBookings / totalBookings;

  await provider.save();

  return provider;
};