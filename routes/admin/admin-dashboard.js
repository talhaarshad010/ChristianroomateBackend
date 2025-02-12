const express = require('express');
const router = express.Router();
const Customer = require('../../models/customer');
const Property =require('../../models/property');
const Order = require('../../models/order')
const SubsHistory = require("../../models/subsHistory")
const config = require('../../common-modules/config');
const CM = require('../../common-modules/index');
const langFunction = CM.Lang_Messages
const Joi = require('joi');

/**
 * @function  stats
 * @description API Will be /api/v1/a/dashboard/stats
 * @example stats
 */

 router.post("/stats", async (req, res) => {
    try {
      let con={
          userCount:await Customer.countDocuments({createdAt:{$gte: new Date(req.body.from),$lt: new Date(req.body.to)}}),
          propertyCount:await Property.countDocuments({createdAt:{$gte: new Date(req.body.from),$lt: new Date(req.body.to)}}),
          paidUsers:(await SubsHistory.find({createdAt:{$gte: new Date(req.body.from),$lt: new Date(req.body.to)}})
            .distinct("userId").lean()).length,
          revenue:(await Order.aggregate([
            {$match: {"createdAt": {$gte: new Date(req.body.from), $lt: new Date(req.body.to)}}},
            {$lookup: {from: "subscriptionplans", localField: "plan", foreignField: "_id", as: "plans"}},
            {$unwind: "$plans"}, {$group: {_id: null, sum: {$sum: "$plans.priceAfterDiscount"}}}
          ]))[0]?.sum ?? 0,
      }
      return res.status(200).json({
        message: langFunction("en", "success"),
        data: con,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: langFunction("en", "servererr"),
      });
    }
  });



module.exports = router;

