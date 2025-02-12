const express = require("express");
const router = express.Router();
const CMS = require("../../common-modules/index");
const Joi = require("joi");
const langFunction = CMS.Lang_Messages;
const Subscription = require("../../models/subscriptionPlan");
const SubsHistory = require("../../models/subsHistory");
const Customer = require("../../models/customer");

/**
 * @function Subscription_List
 * @description API Will be /api/v1/c/subscription/getByPlanType
 * @example Subscription_List
 */

router.post("/getByPlanType", async (req, res) => {
  const planType = req.body.oneTimePlan;
  try {
    const subs = await Subscription.find({ oneTimePlan:planType,status:"ACTIVE" }).sort({createdAt: -1});
    if (!subs) {
      return res.status(400).json({
        message: langFunction("en", "notFound"),
      });
    }

    return res.status(200).json({
      message: langFunction("en", "success"),
      data: subs,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});


/**
 * @function getBySubId
 * @description API Will be /api/v1/c/subscription/getBySubId
 * @example getBySubId
 */

 router.post("/getBySubId", async (req, res) => {
  try {
    const subs = await Subscription.find({ _id:req.body.subsId});
    if (!subs) {
      return res.status(400).json({
        message: langFunction("en", "notFound"),
      });
    }

    return res.status(200).json({
      message: langFunction("en", "success"),
      data: subs,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function Subscription_List
 * @description API Will be /api/v1/c/subscription/getAll
 * @example Subscription_List
 */

router.get("/getAll", async (req, res) => {

  try {
    const subs = await Subscription.find({ status:"ACTIVE" });
    if (!subs) {
      return res.status(400).json({
        message: langFunction("en", "notFound"),
      });
    }

    return res.status(200).json({
      message: langFunction("en", "success"),
      data: subs,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});





/**
 * @function getSubByUserId
 * @description API Will be /api/v1/c/subscription/getSubByUserId
 * @example getSubByUserId
 */
router.get("/getSubByUserId", async (req, res) => {

  try {

    const subs = await SubsHistory.find({ userId:req.doc.id }).populate(["userId","plan"])
    if (!subs) {
      return res.status(400).json({
        message: langFunction("en", "notFound"),
      });
    }

    return res.status(200).json({
      message: langFunction("en", "success"),
      data: subs,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

module.exports = router;
