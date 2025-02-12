const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Subsription = require("../models/subscriptionPlan");
const langFunction = require("../common-modules/lang-messages");

if (!process.env.ADMIN_KEY) {
  throw new Error("ADMIN_KEY IS MISSING FROM ENV");
}
// Customer Routes before Authentication

router.use(require("./customer/customer-login"));
router.use("/", require("./customer/customer-informations"));
router.use("/country", require("./customer/customer-country"));
router.use("/contact", require("./customer/customer-contactus"));
router.use("/testimonial", require("./customer/customer-testimonial"));
router.use("/faqs", require("./customer/customer-faqs"));

router.use("/download", require("./customer/customer-media"));

// ------- ROUTE MIDDLEWARE START ----//
router.use(function (req, res, next) {
  let token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  // decode token
  if (token) {
    // verifies the scret and checks expirationheight: 90px;
    jwt.verify(token, process.env.ADMIN_KEY, function (err, decoded) {
      if (err) {
        return res.status(401).json({
          message: "Session expired. Please sign in again.",
        });
      } else {
        // if everything is good, save to request for use in other routes
        decoded = jwt.decode(token, {
          complete: true,
        });
        req.doc = decoded.payload;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error

    return res.status(401).send({
      message: "No token provided.",
    });
  }
});
// ------- ROUTE MIDDLEWARE END  ----//

// next();

// ------- ROUTE MIDDLEWARE END ----////

router.use("/order", require("./customer/customer-order"));
router.use("/media", require("./customer/customer-media"));
router.use("/subscription", require("./customer/customer-subscription"));
router.use("/tokenRefresh", require("./customer/customer-tokenRefresh"));
router.use("/", require("./customer/customer-profile"));
router.use("/chat", require("./customer/customer-chat"));
router.use("/ticket", require("./customer/customer-tickets"));
router.use("/", require("./customer/customer-user"));
router.use("/amenities", require("./customer/customer-amenities"));

// ------- ROUTE MIDDLEWARE START ----//
router.use(async (req, res, next) => {
  const decoded = req.doc;
  const subsAvailable = await Subsription.findOne({
    status: { $ne: "INACTIVE" },
  });

  if (!subsAvailable) return next();
  if (!decoded.isPlanActive) {
    return res.status(402).send({
      message: langFunction("en", "noplanactive"),
    });
  }
  next();
});

router.use("/request-place", require("./customer/customer-requestplace"));
router.use("/property", require("./customer/customer-property"));
router.use("/bookmark", require("./customer/customer-bookmark"));
router.use("/tenant", require("./customer/customer-tenant"));

// ------- ROUTE MIDDLEWARE END ----//

module.exports = router;
