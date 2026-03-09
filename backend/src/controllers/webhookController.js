const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const whatsappService = require("../services/whatsappService");
const stateService = require("../services/stateServices");
const bookingService = require("../services/bookingService");
const providerController = require("./providerController");

const PROVIDER_MENU = "Provider Menu\n\n1 - View Active Bookings\n2 - Update Availability\n3 - Update Location 📍\n\nType 'customer' to switch to customer mode.";
const CUSTOMER_MENU = "👋 Welcome to SkillShare!\n\n1 - View Services\n2 - Register as Provider\n\nType 'provider' to switch to provider mode.";

exports.handleMessage = async (req, res) => {
  const MessagingResponse = require("twilio").twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  try {
    const from = req.body.From;
    const text = (req.body.Body || "").trim();
    const normalizedText = text.toLowerCase();
    const latitude = parseFloat(req.body.Latitude);
    const longitude = parseFloat(req.body.Longitude);

    const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
    const userState = stateService.getState(from);

    console.log("User:", from);
    console.log("Text:", text);
    console.log("Lat:", latitude, "Lng:", longitude);

    /* ================= START ================= */
    if (userState.step === "START") {
      const providerProfile = await providerController.getProviderProfile(from);
      const hasProviderAccount = !!providerProfile;
      const activeRole =
        userState.activeRole || (hasProviderAccount ? "provider" : "customer");

      if (!userState.activeRole) {
        stateService.setState(from, { activeRole });
      }

      if (normalizedText === "customer" || normalizedText === "switch customer") {
        stateService.setState(from, { step: "START", activeRole: "customer" });
        twiml.message(CUSTOMER_MENU);
        return res.type("text/xml").send(twiml.toString());
      }

      if (normalizedText === "provider" || normalizedText === "switch provider") {
        if (!hasProviderAccount) {
          stateService.setState(from, { step: "START", activeRole: "customer" });
          twiml.message("You are not registered as a provider yet.\n\nReply 2 to register as provider.");
          return res.type("text/xml").send(twiml.toString());
        }

        stateService.setState(from, { step: "START", activeRole: "provider" });
        twiml.message(PROVIDER_MENU);
        return res.type("text/xml").send(twiml.toString());
      }

      if (activeRole === "provider" && hasProviderAccount) {
        if (text === "1") {
          const bookings = await providerController.getActiveBookings(providerProfile._id);

          if (!bookings.length) {
            twiml.message("No active bookings right now.");
            return res.type("text/xml").send(twiml.toString());
          }

          let reply = "Your Active Bookings\n\n";
          bookings.forEach((booking, index) => {
            reply += `${index + 1}. ${booking.customerNumber}\nStatus: ${booking.status}\nService: ${booking.serviceType}\n\n`;
          });

          twiml.message(reply.trim());
          return res.type("text/xml").send(twiml.toString());
        }

        if (text === "2") {
          const nextStatus =
            providerProfile.availability === "available" ? "unavailable" : "available";

          await providerController.updateAvailability(from, nextStatus);
          twiml.message(`Availability updated ✅\nCurrent status: ${nextStatus}`);
          return res.type("text/xml").send(twiml.toString());
        }

        if (text === "3") {
          stateService.setState(from, { step: "UPDATE_LOCATION" });
          twiml.message("Please send your new live location 📍");
          return res.type("text/xml").send(twiml.toString());
        }

        twiml.message(PROVIDER_MENU);
        return res.type("text/xml").send(twiml.toString());
      }

      if (text === "1") {
        stateService.setState(from, { step: "WAITING_LOCATION" });
        twiml.message("Please share your live location 📍");
        return res.type("text/xml").send(twiml.toString());
      }

      if (text === "2") {
        stateService.setState(from, { step: "ASK_NAME" });
        twiml.message("Enter your name:");
        return res.type("text/xml").send(twiml.toString());
      }

      twiml.message(CUSTOMER_MENU);
      return res.type("text/xml").send(twiml.toString());
    }

    /* ================= PROVIDER REGISTRATION ================= */
    if (userState.step === "ASK_NAME") {
      if (!text) {
        twiml.message("Please enter your name to continue registration.");
        return res.type("text/xml").send(twiml.toString());
      }

      stateService.setState(from, { step: "ASK_SERVICE", name: text });
      twiml.message("Enter your service type (example: Plumber, Electrician):");
      return res.type("text/xml").send(twiml.toString());
    }

    if (userState.step === "ASK_SERVICE") {
      if (!text) {
        twiml.message("Please enter your service type.");
        return res.type("text/xml").send(twiml.toString());
      }

      stateService.setState(from, { step: "ASK_LOCATION", serviceType: text });
      twiml.message("Please send your live WhatsApp location 📍");
      return res.type("text/xml").send(twiml.toString());
    }

    if (userState.step === "ASK_LOCATION") {
      if (!hasLocation) {
        twiml.message("Location missing. Please send your live WhatsApp location 📍");
        return res.type("text/xml").send(twiml.toString());
      }

      try {
        await providerController.registerProvider(
          from,
          userState.name,
          userState.serviceType,
          { latitude, longitude }
        );

        twiml.message("Registration Complete ✅ You are now visible to nearby customers.");
        stateService.clearState(from);
        return res.type("text/xml").send(twiml.toString());
      } catch (error) {
        console.error("Provider registration failed:", error.message);
        twiml.message("We could not complete registration right now. Please try again.");
        return res.type("text/xml").send(twiml.toString());
      }
    }

    /* ================= UPDATE PROVIDER LOCATION ================= */
    if (userState.step === "UPDATE_LOCATION") {
      if (!hasLocation) {
        twiml.message("Please send your new live location 📍");
        return res.type("text/xml").send(twiml.toString());
      }

      try {
        const updatedProvider = await providerController.updateLocation(from, {
          latitude,
          longitude
        });

        if (!updatedProvider) {
          stateService.clearState(from);
          twiml.message("Provider profile not found. Please register first by typing 2.");
          return res.type("text/xml").send(twiml.toString());
        }

        stateService.clearState(from);
        twiml.message("Location updated successfully ✅");
        return res.type("text/xml").send(twiml.toString());
      } catch (error) {
        console.error("Provider location update failed:", error.message);
        twiml.message("Unable to update location right now. Please try again.");
        return res.type("text/xml").send(twiml.toString());
      }
    }

    /* ================= CUSTOMER: WAITING LOCATION ================= */
    if (userState.step === "WAITING_LOCATION") {
      if (!hasLocation) {
        twiml.message("Please send live location using WhatsApp location feature 📍");
        return res.type("text/xml").send(twiml.toString());
      }

      const searchRadii = [5000, 10000, 20000];
      let providers = [];

      for (const radius of searchRadii) {
        providers = await Provider.find({
          availability: "available",
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              $maxDistance: radius
            }
          }
        });

        if (providers.length > 0) {
          console.log(`Providers found within ${radius / 1000} km`);
          break;
        }
      }

      if (!providers.length) {
        twiml.message(
          "No providers found within 20 km 😔\n\nWould you like to expand search to 30 km?\nReply YES to continue."
        );
        stateService.setState(from, {
          step: "EXPAND_SEARCH",
          latitude,
          longitude
        });
        return res.type("text/xml").send(twiml.toString());
      }

      let reply = "Top Providers ⭐\n\n";
      providers.slice(0, 5).forEach((provider, index) => {
        reply += `${index + 1}. ${provider.name} (${provider.serviceType})\nRating: ${provider.rating}\n\n`;
      });

      stateService.setState(from, {
        step: "SELECT_PROVIDER",
        providers: providers.slice(0, 5).map((provider) => provider._id)
      });

      twiml.message(reply.trim());
      return res.type("text/xml").send(twiml.toString());
    }

    /* ================= CUSTOMER: EXPAND SEARCH ================= */
    if (userState.step === "EXPAND_SEARCH") {
      if (normalizedText !== "yes") {
        twiml.message("Okay 👍 You can restart search anytime by typing 1.");
        stateService.clearState(from);
        return res.type("text/xml").send(twiml.toString());
      }

      const providers = await Provider.find({
        availability: "available",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [userState.longitude, userState.latitude]
            },
            $maxDistance: 30000
          }
        }
      });

      if (!providers.length) {
        twiml.message("Still no providers found 😔");
        stateService.clearState(from);
        return res.type("text/xml").send(twiml.toString());
      }

      let reply = "Providers within 30 km ⭐\n\n";
      providers.slice(0, 5).forEach((provider, index) => {
        reply += `${index + 1}. ${provider.name} (${provider.serviceType})\nRating: ${provider.rating}\n\n`;
      });

      stateService.setState(from, {
        step: "SELECT_PROVIDER",
        providers: providers.slice(0, 5).map((provider) => provider._id)
      });

      twiml.message(reply.trim());
      return res.type("text/xml").send(twiml.toString());
    }

    /* ================= CUSTOMER: SELECT PROVIDER ================= */
    if (userState.step === "SELECT_PROVIDER") {
      const index = parseInt(text, 10) - 1;

      if (
        Number.isNaN(index) ||
        index < 0 ||
        !Array.isArray(userState.providers) ||
        index >= userState.providers.length
      ) {
        twiml.message("Invalid selection ❌ Please choose a valid number.");
        return res.type("text/xml").send(twiml.toString());
      }

      const providerId = userState.providers[index];
      const provider = await Provider.findById(providerId);

      if (!provider) {
        twiml.message("Selected provider is no longer available. Please try again.");
        stateService.clearState(from);
        return res.type("text/xml").send(twiml.toString());
      }

      const booking = await bookingService.createBooking(from, providerId);

      twiml.message(`Booking Created ✅\n\nProvider: ${provider.name}\nStatus: Pending`);

      await whatsappService.sendMessage(
        provider.whatsappNumber,
        `📩 New Booking Request\n\nCustomer: ${from}\nService: ${provider.serviceType}\n\nReply:\n1 - Accept\n2 - Reject`
      );

      stateService.setState(provider.whatsappNumber, {
        step: "PROVIDER_BOOKING_RESPONSE",
        bookingId: booking._id
      });

      stateService.clearState(from);
      return res.type("text/xml").send(twiml.toString());
    }

    /* ================= PROVIDER BOOKING RESPONSE ================= */
    if (userState.step === "PROVIDER_BOOKING_RESPONSE") {
      const booking = await Booking.findById(userState.bookingId);

      if (!booking) {
        stateService.clearState(from);
        return res.sendStatus(200);
      }

      if (text === "1") {
        booking.status = "accepted";
        await booking.save();

        await whatsappService.sendMessage(
          booking.customerNumber,
          "🎉 Your booking has been ACCEPTED!"
        );

        stateService.setState(from, {
          step: "PROVIDER_MARK_COMPLETE",
          bookingId: booking._id
        });

        await whatsappService.sendMessage(
          from,
          "You accepted the booking ✅\nType 'complete' after finishing job."
        );

        return res.sendStatus(200);
      }

      if (text === "2") {
        booking.status = "cancelled";
        await booking.save();

        await whatsappService.sendMessage(booking.customerNumber, "❌ Your booking was rejected.");

        stateService.clearState(from);
        return res.sendStatus(200);
      }
    }

    /* ================= PROVIDER MARK COMPLETE ================= */
    if (userState.step === "PROVIDER_MARK_COMPLETE") {
      if (normalizedText !== "complete") {
        await whatsappService.sendMessage(from, "Type 'complete' after finishing service.");
        return res.sendStatus(200);
      }

      const booking = await Booking.findById(userState.bookingId);
      if (!booking) {
        stateService.clearState(from);
        return res.sendStatus(200);
      }

      booking.status = "completed";
      await booking.save();

      await whatsappService.sendMessage(
        booking.customerNumber,
        "✅ Service completed!\n\nPlease rate provider from 1 to 5 ⭐"
      );

      stateService.setState(booking.customerNumber, {
        step: "CUSTOMER_RATING",
        bookingId: booking._id,
        providerId: booking.providerId
      });

      stateService.clearState(from);
      return res.sendStatus(200);
    }

    /* ================= CUSTOMER RATING ================= */
    if (userState.step === "CUSTOMER_RATING") {
      const rating = parseInt(text, 10);

      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        await whatsappService.sendMessage(from, "Please send rating between 1 and 5 ⭐");
        return res.sendStatus(200);
      }

      const booking = await Booking.findById(userState.bookingId);
      const provider = await Provider.findById(userState.providerId);

      if (!booking || !provider) {
        stateService.clearState(from);
        return res.sendStatus(200);
      }

      booking.rating = rating;
      await booking.save();

      const totalScore = provider.rating * provider.totalReviews + rating;
      provider.totalReviews += 1;
      provider.rating = totalScore / provider.totalReviews;

      const totalBookings = await Booking.countDocuments({ providerId: provider._id });
      const completedBookings = await Booking.countDocuments({
        providerId: provider._id,
        status: "completed"
      });

      provider.completionRate = totalBookings ? completedBookings / totalBookings : 0;
      await provider.save();

      await whatsappService.sendMessage(from, "Thank you for rating ⭐");
      stateService.clearState(from);
      return res.sendStatus(200);
    }

    twiml.message("Type 'hi' to start.");
    return res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("Webhook error:", error.message);
    twiml.message("Something went wrong. Please try again.");
    return res.type("text/xml").send(twiml.toString());
  }
};
