const Booking = require("../models/Booking");
const Provider = require("../models/Provider");

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
  if (!booking) return null;

  booking.status = "accepted";
  await booking.save();

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


/* ================= ADD RATING ================= */

exports.addRating = async (bookingId, providerId, rating) => {

  const booking = await Booking.findById(bookingId);
  const provider = await Provider.findById(providerId);

  if (!booking || !provider) return null;

  booking.rating = rating;
  await booking.save();

  // Update provider rating
  const totalScore = provider.rating * provider.totalReviews + rating;

  provider.totalReviews += 1;
  provider.rating = totalScore / provider.totalReviews;

  // Update completion rate
  const totalBookings = await Booking.countDocuments({
    providerId: provider._id
  });

  const completedBookings = await Booking.countDocuments({
    providerId: provider._id,
    status: "completed"
  });

  provider.completionRate = completedBookings / totalBookings;

  await provider.save();

  return { booking, provider };
};