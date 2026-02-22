const Provider = require('../models/Provider');

/* ================= REGISTER PROVIDER ================= */
exports.registerProvider = async (from, name, service, location) => {

  const newProvider = new Provider({
    whatsappNumber: from,
    name,
    serviceType: service,
    location: {
      type: "Point",
      coordinates: [location.longitude, location.latitude]
    }
  });

  await newProvider.save();
  return newProvider;
};

/* ================= UPDATE AVAILABILITY ================= */
exports.updateAvailability = async (from, option) => {

  const provider = await Provider.findOne({ whatsappNumber: from });
  if (!provider) return null;

  if (option === "1") provider.availability = "available";
  else if (option === "2") provider.availability = "unavailable";
  else return "INVALID";

  await provider.save();
  return provider.availability;
};

/* ================= GET ACTIVE BOOKINGS ================= */
exports.getActiveBookings = async (providerId) => {
  const Booking = require('../models/Booking');

  return await Booking.find({
    providerId,
    status: { $in: ["pending", "accepted"] }
  });
};