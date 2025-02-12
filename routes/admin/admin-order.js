const express = require("express");
const router = express.Router();
const CMS = require("../../common-modules/index");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Joi = require("joi");
const langFunction = CMS.Lang_Messages;
const Subscription = require("../../models/subscriptionPlan");
const Order = require("../../models/order");
const SubsHistory = require("../../models/subsHistory");
const Customer = require("../../models/customer");
const path = require("path");
const csv=CMS.Csv;
const findRemoveSync = require("find-remove");
const CM = require("../../common-modules");


/**
 * @function getOrderHistoryByUserId
 * @description API Will be /api/v1/a/order/getOrderHistoryByUserId
 * @example  getOrderHistoryByUserId
 * */
 router.post('/getOrderHistoryByUserId', async (req, res) => {
  try {
      let userData = req.body;

      let validator = Joi.object({
          page: Joi.number().required().messages({
              '*': `page ${langFunction("en", "feildmissing")}`
          }),
          perPage: Joi.number().required().messages({
              '*': `perPage ${langFunction("en", "feildmissing")}`
          }),
          status: Joi.allow("", null),
          user: Joi.allow(),
          searchString: Joi.string().allow("", null),
        //   status: Joi.string().required().messages({
        //     '*': `status ${langFunction("en", "feildmissing")}`
        // }),
      })

      let {
          error
      } = validator.validate(userData);
      if (error) {
          return res.status(400).json({
              "message": error.details[0].message,
              error
          });
      }

      let startIndex = ((userData.page - 1) * userData.perPage);
      let perPage = parseInt(userData.perPage);
      skipCondition = {
          skip: startIndex,
          limit: perPage,
          sort: { 'createdAt': -1 }
      };
      let con = {}

      if(userData.user){
        con.user = userData.user;
      }

      if(userData.status){
        con.status = userData.status.toUpperCase();
      }

    if (userData.searchString) {
      con["$or"] = [
        {
          orderId: new RegExp(userData.searchString, "i"),
        },
      ];
    }

      let doc = await Order.find(
          con, {},
          skipCondition
      ).populate(['user','plan'])
      let totalCount = await Order.countDocuments(con);
      return res.status(200).json({
          "result": doc,
          totalCount,
          "message": langFunction('en', 'success'),
      });
  } catch (error) {
      console.error(error);
      return res.status(400).json({
          message: langFunction('en', 'servererr')
      });
  }
})

/**
 * @function getOrderById
 * @description API Will be /api/v1/a/order/getOrderById
 * @example  getOrderById
 * */
router.get('/getOrderById/:id', async (req, res) => {
  try {
    let orderId = req.params.id;

    let doc = await Order.find({_id: orderId}).populate(['user','plan'])
    return res.status(200).json({
      "result": doc,
      "message": langFunction('en', 'success'),
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction('en', 'servererr')
    });
  }
})

/**
 * @function  export
 * @description API Will be  /api/v1/a/order/export
 * @example exportCSV
 */
 router.get("/export", async (req, res) => {
    try {

      let doc = await Order.aggregate([
        {$lookup: {from: "customers", localField: "user", foreignField: "_id", as: "user"}},
        {$unwind: {path: "$user", "preserveNullAndEmptyArrays": true}},
        {$lookup: {from: "subscriptionplans", localField: "plan", foreignField: "_id", as: "plan"}},
        {$unwind: {path: "$plan", "preserveNullAndEmptyArrays": true}},
        {$project: {_id: 0, "Order Id": "$orderId", "Invoice Number": "$invoiceNumber", "Username": "$user.username", "Subscription Plan": "$plan.title", "Transaction Amount": "$plan.priceAfterDiscount", Status: "$status", "Transaction Date": {$dateToString: {format: "%m-%d-%Y %H:%M", date: "$createdAt"}},}}
    ])

      const sortOrder = ["SNo", "Order Id", "Invoice Number", "Username", "Subscription Plan", "Transaction Amount", "Status", "Transaction Date"]

      doc = CM.SortObj(doc, sortOrder);

      if(doc.length>0){
        const csvFileName=await csv(doc);
        const opt = {
          root: path.join(__dirname, "../..", "csv"),
        };

        res.sendFile(`${csvFileName}.csv`, opt);
           setTimeout(() => {
                const csvpath = path.join(__dirname, "../../")
                const result = findRemoveSync(csvpath, {
                  dir: 'csv',
                });
          }, 100);
          return;
      }else{

        return res.status(500).json({
            message: langFunction('en', 'error')
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: langFunction("en", "servererr"),
      });
    }
});

module.exports = router;
