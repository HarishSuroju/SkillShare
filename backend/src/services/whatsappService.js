const twilio = require('twilio');
const axios = require('axios');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendMessage = async (to, message) => {
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message
    });

    console.log("📤 Twilio WhatsApp Message Sent");
  } catch (error) {
    console.error("Twilio Error:", error.message);
  }
};
// exports.sendMessage = async (to, message) => {
//   try {
//     await axios.post(
//       `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
//       {
//         messaging_product: "whatsapp",
//         to: to,
//         type: "text",
//         text: { body: message }
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//   } catch (error) {
//     console.error("Error sending message:", error.response?.data || error.message);
//   }
// };
