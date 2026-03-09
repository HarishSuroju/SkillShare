const express = require('express');
const mongoose = require('mongoose');

const webhookRoutes = require('./routes/webhookRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch(err => console.error("MongoDB Error ❌", err));

/* ================= ROUTES ================= */

app.use('/webhook', webhookRoutes);
app.use('/providers', providerRoutes);
app.use('/bookings', bookingRoutes);

/* ================= HEALTH CHECK ================= */

app.get('/', (req, res) => {
  res.send("SkillShare Backend Running 🚀");
});

module.exports = app;