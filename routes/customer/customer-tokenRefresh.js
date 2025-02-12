const express = require("express");
const router = express.Router();
const CM = require("../../common-modules/index");
const Subsription = require("../../models/subscriptionPlan");
const langFunction = CM.Lang_Messages;

/**
 * @function  API_refresh_token_user
 * @description API Will be /api/v1/c/tokenRefresh
 * @example API_token_refresh_user
 */

const Customer = require("../../models/customer");
const jwt = require("jsonwebtoken");
router.get("/", async (req, res) => {
  try {
    const subsAvailable = await Subsription.findOne({
      status: { $ne: "INACTIVE" },
    });
    const { isPlanActive } = await Customer.findOne(
      { _id: req.doc.id },
      "isPlanActive"
    );
    let payLoadNew = {
      id: req.doc.id,
      isPlanActive,
    };
    let tokenNew = jwt.sign(payLoadNew, process.env.ADMIN_KEY, {
      expiresIn: "24h", // expires in 1 Day
    });
    if (subsAvailable && isPlanActive) {
      return res.json({ token: tokenNew });
    } else {
      return res.status(402).json({ token: tokenNew });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: langFunction("en", "servererr"),
    });
  }
});

module.exports = router;
