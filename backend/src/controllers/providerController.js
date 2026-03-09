const Provider = require("../models/Provider");
const Booking = require("../models/Booking");

/* ================= REGISTER PROVIDER ================= */

exports.registerProvider = async (whatsappNumber, name, serviceType, location) => {
  if (
    !location ||
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude)
  ) {
    throw new Error("Valid location is required");
  }

  const existing = await Provider.findOne({ whatsappNumber });

  if (existing) {
    existing.name = name;
    existing.serviceType = serviceType;
    existing.location = {
      type: "Point",
      coordinates: [location.longitude, location.latitude]
    };
    existing.isActive = true;
    await existing.save();
    return existing;
  }

  const provider = new Provider({
    whatsappNumber,
    name,
    serviceType,
    location: {
      type: "Point",
      coordinates: [location.longitude, location.latitude]
    }
  });

  await provider.save();
  return provider;
};

/* ================= UPDATE LOCATION ================= */

exports.updateLocation = async (whatsappNumber, location) => {
  if (
    !location ||
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude)
  ) {
    throw new Error("Valid location is required");
  }

  const provider = await Provider.findOne({ whatsappNumber });

  if (!provider) return null;

  provider.location = {
    type: "Point",
    coordinates: [location.longitude, location.latitude]
  };

  await provider.save();
  return provider;
};


/*  ================= UPDATE AVAILABILITY ================= */

exports.updateAvailability = async (whatsappNumber, status) => {

  const provider = await Provider.findOne({ whatsappNumber });

  if (!provider) return null;

  provider.availability = status;
  await provider.save();

  return provider;
};


/* ================= GET ACTIVE BOOKINGS ================= */

exports.getActiveBookings = async (providerId) => {

  return await Booking.find({
    providerId,
    status: { $in: ["pending", "accepted"] }
  });
};


/* ================= GET PROVIDER PROFILE ================= */

exports.getProviderProfile = async (whatsappNumber) => {

  return await Provider.findOne({ whatsappNumber });
};
