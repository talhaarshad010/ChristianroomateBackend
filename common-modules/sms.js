/** @format */

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

// const sendSms = (phone, message) => {
//   console.log(phone, message);
//   const client = require("twilio")(accountSid, authToken);
//   client.messages
//     .create({
//       body: message,
//       to: phone,
//       messagingServiceSid: process.env.MESSAGING_SERVICE_ID,
//     })
//     .then((message) => console.log(message.sid))
//     .catch((err) => console.log("Twilio Error", err));
// };
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// const sendSms = async (toPhone) => {
//   await client.lookups.v1
//     .phoneNumbers(toPhone)
//     .fetch({ type: ["carrier"] })
//     .then((phone_number) => console.log(phone_number.carrier))
//     .catch(
//       (error) => console.log("Error:", error)
//       // console.log("LOOKERR:", error.message)
//     );

//   await client.verify.v2
//     .services(process.env.VERIFY_SERVICE_ID)
//     .verifications.create({ to: toPhone, channel: "sms" })
//     .then((verification) =>
//       console.log("Verification", verification.sid, verification.channel)
//     )
//     .catch((err) => {
//       console.log(`NOT Sent`, err.message);
//       console.log(`NOT Sent`, err);
//     });
// };

const sendSms = async (phone, message) => {
  const client = require("twilio")(accountSid, authToken);

  try {
    const data = await client.messages.create({
      body: message,
      to: phone,
      messagingServiceSid: process.env.MESSAGING_SERVICE_ID,
    });

    return { success: true };
  } catch (error) {
    return { Failed: true, error: error.message };
  }
};
module.exports = { sendSms };
