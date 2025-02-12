const express = require("express");
const router = express.Router();
const Customer = require("../../models/customer");
const Subsription = require("../../models/subscriptionPlan");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;

/**
 * @function  myProfile
 * @description API Will be /api/v1/c/myProfile
 * @example myProfile
 */

router.get("/myProfile", async (req, res) => {
  try {
    let user = await Customer.findOne({
      _id: req.doc.id,
    }).populate(["image", "galleryImage", "currentPlan"]);

    return res.status(200).json({
      message: langFunction("en", "success"),
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

router.get("/checkSubscription", async (req, res) => {
  try {
    let user = await Subsription.findOne({ status: { $ne: "INACTIVE" } });

    return res.status(200).json({
      message: langFunction("en", "success"),
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

module.exports = router;
