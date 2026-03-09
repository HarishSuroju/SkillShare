const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

exports.createBooking = async (customerNumber, providerId) => {
  const provider = await Provider.findById(providerId);

  if (!provider) {
    throw new Error("Provider not found");
  }

  const resolvedServiceType = provider.serviceType || "General";

  // Backfill legacy providers that were created before serviceType existed.
  if (!provider.serviceType) {
    provider.serviceType = resolvedServiceType;
    await provider.save();
  }

  const booking = new Booking({
    customerNumber,
    providerId,
    serviceType: resolvedServiceType
  });

  await booking.save();

  return booking;
};
