const path = require("path");
const langFunction = require("../common-modules/lang-messages");
const fs = require("fs");
const User = require("../models/customer");
const hbs = require("handlebars");
const sgMail = require("@sendgrid/mail");
// require("dotenv").config({
//   path: path.join(__dirname) + "/.env",
// });

if (!process.env.SENDGRID_KEY) {
  throw new Error("SEND GRID KEY IS MISSING FROM ENV");
}

const { getMaxListeners } = require("process");
sgMail.setApiKey(process.env.SENDGRID_KEY);

/**
 * function that verify the account with otp at the time of user registration
 * Pass userId , req.lang and otpCode as arguments when calling the function
 */

const send_otp_email = async (userId, otpCode) => {
  try {
    let fileName = "register.html";

    let user = await User.findOne({ _id: userId }, { name: 1, email: 1 });
    if (user) {
      let htmlPath = path.join(__dirname, `emailTemplate/${fileName}`);
      let readFile = fs.readFileSync(htmlPath, "utf-8");
      const template = hbs.compile(readFile);

      const html = template({
        otp: otpCode,
      });
      const msg = {
        to: user.email,
        from: process.env.EMAIL_NAME,
        subject: "Christian Roommates one-time passcode",
        html: html,
      };
      await sgMail.send(msg);
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.error(error);
  }
};
/**
 * function for the welcome_email will give the confirmation that user has successfully registered the account
 * Pass userId and req.lang as arguments when calling the function
 */
const send_welcome_email = async (userId) => {
  try {
    let fileName = "register.html";

    let user = await User.findOne({ _id: userId }, { name: 1, email: 1 });

    if (user) {
      let htmlPath = path.join(__dirname, `emailTemplate/${fileName}`);
      let readFile = fs.readFileSync(htmlPath, "utf-8");
      const template = hbs.compile(readFile);

      const html = template({
        name: user.name.toUpperCase(),
        email: user.email,
        msg: langFunction("en", "sendWelcome"),
      });
      const msg = {
        to: user.email,
        from: process.env.EMAIL_NAME,
        subject: "ChristianRoommate || WELCOME-EMAIL",
        html: html,
      };
      let data = await sgMail.send(msg);
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * function for the send_forgotPass_email will give the new Password of account
 * Pass userId , req.lang and otpCode of service as arguments when calling the function
 */

const send_forgotPass_email = async (userId, otpCode) => {
  try {
    let fileName = "reset.html";

    let user = await User.findOne({ _id: userId }, { name: 1, email: 1 });
    if (user) {
      let htmlPath = path.join(__dirname, `emailTemplate/${fileName}`);
      let readFile = fs.readFileSync(htmlPath, "utf-8");
      const template = hbs.compile(readFile);

      const html = template({
        otp: otpCode,
      });
      console.log(user.email);
      const msg = {
        to: user.email,
        from: process.env.EMAIL_NAME,
        subject: "Christian Roommates one-time passcode",
        html: html,
      };
      await sgMail.send(msg).then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      });
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.log(error);
    console.error(error);
  }
};

const send_SubscriptionExpiredSoon_email = async (userId, smsExpDate) => {
  try {
    let fileName = "plan-expiry.html";

    let user = await User.findOne({ _id: userId }, { name: 1, email: 1 });
    if (user) {
      let htmlPath = path.join(__dirname, `emailTemplate/${fileName}`);
      let readFile = fs.readFileSync(htmlPath, "utf-8");
      const template = hbs.compile(readFile);

      const html = template({
        name: user.name.toUpperCase(),
        email: user.email,
        date: smsExpDate,
        // msg : langFunction("en", 'expirySubscription').replace('#id#' , `<b>${id}</b>`)
      });
      const msg = {
        to: user.email,
        from: process.env.EMAIL_NAME,
        subject: "Your Christian Roommates subscription is expiring soon ",
        html: html,
      };
      await sgMail.send(msg);
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * function that verify the payment success to the customer
 */

const send_payment_success = async (userId, amount, expDate, plan) => {
  try {
    let fileName = "paymet-success.html";

    let user = await User.findOne(
      { _id: userId },
      { name: 1, email: 1, createdAt: 1 }
    );
    if (user) {
      let htmlPath = path.join(__dirname, `emailTemplate/${fileName}`);
      let readFile = fs.readFileSync(htmlPath, "utf-8");
      const template = hbs.compile(readFile);

      const html = template({
        name: user.name.toUpperCase(),
        amount: amount,
        date: expDate,
        signupDate: user.createdAt,
        plan: plan,
      });
      const msg = {
        to: user.email,
        from: process.env.EMAIL_NAME,
        subject:
          "You have successfully paid for your Christian Roommates subscription",
        html: html,
      };
      await sgMail.send(msg);
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * function for user disabled by admin
 */

const send_user_disabled = async (userId, amount, expDate, plan) => {
  try {
    let fileName = "user-disabled.html";

    let user = await User.findOne(
      { _id: userId },
      { name: 1, email: 1, createdAt: 1 }
    );
    if (user) {
      let htmlPath = path.join(__dirname, `emailTemplate/${fileName}`);
      let readFile = fs.readFileSync(htmlPath, "utf-8");
      const template = hbs.compile(readFile);

      const html = template({
        name: user.name.toUpperCase(),
      });
      const msg = {
        to: user.email,
        from: process.env.EMAIL_NAME,
        subject: "ChristianRoommate || Account Terminated",
        html: html,
      };
      await sgMail.send(msg);
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * function for listings approval
 */

const property_approval = async (userId, listingId) => {
  try {
    let fileName = "property-approved.html";

    let user = await User.findOne(
      { _id: userId },
      { name: 1, email: 1, createdAt: 1 }
    );
    if (user) {
      let htmlPath = path.join(__dirname, `emailTemplate/${fileName}`);
      let readFile = fs.readFileSync(htmlPath, "utf-8");
      const template = hbs.compile(readFile);

      const html = template({
        name: user.name.toUpperCase(),
        listingId,
      });
      const msg = {
        to: user.email,
        from: process.env.EMAIL_NAME,
        subject: "ChristianRoommate || Property Approved",
        html: html,
      };
      await sgMail.send(msg);
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * function for plan auto-renew
 */

const send_auto_renew = async (userId, date) => {
  try {
    let fileName = "auto-renewel.html";

    let user = await User.findOne(
      { _id: userId },
      { name: 1, email: 1, createdAt: 1 }
    );
    if (user) {
      let htmlPath = path.join(__dirname, `emailTemplate/${fileName}`);
      let readFile = fs.readFileSync(htmlPath, "utf-8");
      const template = hbs.compile(readFile);

      const html = template({
        name: user.name.toUpperCase(),
        date,
      });
      const msg = {
        to: user.email,
        from: process.env.EMAIL_NAME,
        subject: "ChristianRoommate || Plan Auto Renew",
        html: html,
      };
      await sgMail.send(msg);
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * function that verify the subscription cancel for the customer
 */

const send_cancel_success = async (userId) => {
  try {
    let fileName = "cancelation.html";

    let user = await User.findOne(
      { _id: userId },
      { name: 1, email: 1, createdAt: 1, isEmailVerified: 1 }
    );
    if (user) {
      if (user.isEmailVerified) {
        let htmlPath = path.join(__dirname, `emailTemplate/${fileName}`);
        let readFile = fs.readFileSync(htmlPath, "utf-8");
        const template = hbs.compile(readFile);

        const html = template({
          name: user.name.toUpperCase(),
        });
        const msg = {
          to: user.email,
          from: process.env.EMAIL_NAME,
          subject: "ChristianRoomate || Subscription Cancel Successfully",
          html: html,
        };

        await sgMail.send(msg);
        console.log("Cancel Subscription mail sent");
      }
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  send_otp_email,
  send_welcome_email,
  send_forgotPass_email,
  send_SubscriptionExpiredSoon_email,
  send_payment_success,
  send_cancel_success,
  send_user_disabled,
  property_approval,
  send_auto_renew,
};
