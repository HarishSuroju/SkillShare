const Provider = require('../models/Provider');
const whatsappService = require('../services/whatsappService');
const stateService = require('../services/stateServices');
const matchingService = require('../services/matchingService');

const providerController = require('./providerController');
const bookingController = require('./bookingController');

exports.handleMessage = async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body?.trim();
    const location = message.location;

    const userState = stateService.getState(from);
    const providerAccount = await Provider.findOne({ whatsappNumber: from });
    const role = providerAccount ? "PROVIDER" : "CUSTOMER";

    /* ================= START ================= */
    if (userState.step === "START") {

      if (role === "PROVIDER") {
        await whatsappService.sendMessage(
          from,
          "1 - View Active Bookings\n2 - Update Availability"
        );
        return res.sendStatus(200);
      }

      if (text === "1") {
        await whatsappService.sendMessage(from, "Share location 📍");
        stateService.setState(from, { step: "WAITING_LOCATION" });
        return res.sendStatus(200);
      }

      if (text === "2") {
        await whatsappService.sendMessage(from, "Enter your name:");
        stateService.setState(from, { step: "ASK_NAME" });
        return res.sendStatus(200);
      }

      await whatsappService.sendMessage(
        from,
        "👋 Welcome to SkillShare\n\n1 - View Services\n2 - Register"
      );

      return res.sendStatus(200);
    }

    /* ================= REGISTRATION ================= */
    if (userState.step === "ASK_NAME") {
      stateService.setState(from, { step: "ASK_SERVICE", name: text });
      await whatsappService.sendMessage(from, "What service?");
      return res.sendStatus(200);
    }

    if (userState.step === "ASK_SERVICE") {
      stateService.setState(from, {
        step: "ASK_LOCATION",
        name: userState.name,
        service: text
      });
      await whatsappService.sendMessage(from, "Send location 📍");
      return res.sendStatus(200);
    }

    if (userState.step === "ASK_LOCATION" && location) {
      await providerController.registerProvider(
        from,
        userState.name,
        userState.service,
        location
      );

      await whatsappService.sendMessage(from, "Registered ✅");
      stateService.clearState(from);
      return res.sendStatus(200);
    }

    /* ================= CUSTOMER SEARCH ================= */
    if (userState.step === "WAITING_LOCATION" && location) {

      const providers = await Provider.find({
        availability: "available",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [location.longitude, location.latitude]
            },
            $maxDistance: 10000
          }
        }
      });

      const ranked = matchingService.rankProviders(
        providers,
        location.latitude,
        location.longitude
      );

      let reply = "Top Providers:\n\n";
      ranked.slice(0, 5).forEach((p, i) => {
        reply += `${i + 1}. ${p.name}\n`;
      });

      await whatsappService.sendMessage(from, reply);

      stateService.setState(from, {
        step: "SELECT_PROVIDER",
        providers: ranked.slice(0, 5).map(p => p._id)
      });

      return res.sendStatus(200);
    }

    /* ================= SELECT PROVIDER ================= */
    if (userState.step === "SELECT_PROVIDER") {

      const index = parseInt(text) - 1;
      const providerId = userState.providers[index];
      const provider = await Provider.findById(providerId);

      const booking = await bookingController.createBooking(
        from,
        providerId,
        provider.serviceType
      );

      await whatsappService.sendMessage(from, "Booking Created ✅");

      await whatsappService.sendMessage(
        provider.whatsappNumber,
        "New Booking\n1 - Accept\n2 - Reject"
      );

      stateService.setState(provider.whatsappNumber, {
        step: "PROVIDER_BOOKING_RESPONSE",
        bookingId: booking._id
      });

      stateService.clearState(from);
      return res.sendStatus(200);
    }

    res.sendStatus(200);

  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};