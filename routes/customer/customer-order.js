const express = require("express");
const router = express.Router();
const CMS = require("../../common-modules/index");
const {createOrder} = CMS.CreateOrder;
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Joi = require("joi");
const langFunction = CMS.Lang_Messages;
const Subscription = require("../../models/subscriptionPlan");
const Order = require("../../models/order");
const SubsHistory = require("../../models/subsHistory");
const Customer = require("../../models/customer");
const Email = require('../../common-modules/email');
const { makePayment, cancel, checkPayment } = require("../../common-modules/createOrder");

/**
 * @function Create_Order
 * @description API Will be /api/v1/c/order/createOrder
 * @example Create_Order
 */

router.post("/createOrder", async (req, res) => {
  const userData = req.body;
  const response = await createOrder(userData, req.doc.id);
  return res.status(response.status).json({message: response.msg, data: response.data});
});

/**
 * @function Create_stripe_Session_Inr
 * @description API Will be /api/v1/c/order/payment
 * @example  Create_stripe_Session_Inr
 * */

router.post("/payment", async (req, res) => {
  const userData = req.body;
  const response = await makePayment(userData, req);
  if(response.status === 200) return res.status(response.status).json({...response.msg});
  return res.status(response.status).json({message: response.msg});
});

/**
 * @function Check_Payment
 * @description API Will be /api/v1/c/order/checkPayment/:id
 * @example  Check_Payment
 * */

router.get("/checkPayment/:id", async (req, res) => {
  const response = await checkPayment(req.doc.id, req.params.id);
  return res.status(response.status).json({message: response.msg, stripe_status: response.stripe_status, token: response.token});
});

/**
 * @function Check_Payment
 * @description API Will be /api/v1/c/order/cancel/:id
 * @example  Check_Payment
 * */

router.get("/cancel", async (req, res) => {
  const response = await cancel(req.doc.id, req.params.id)
  return res.status(200).json({message: response.msg});
});

/**
 * @function getOrderById
 * @description API Will be /api/v1/c/order/getOrderById
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
 * @function getOrderHistory
 * @description API Will be /api/v1/c/order/getOrderHistory
 * @example  getOrderHistory
 * */

 router.post('/getOrderHistory', async (req, res) => {
  try {
      let userData = req.body;

      let validator = Joi.object({
          page: Joi.number().required().messages({
              '*': `page ${langFunction("en", "feildmissing")}`
          }),
          perPage: Joi.number().required().messages({
              '*': `perPage ${langFunction("en", "feildmissing")}`
          }),
          status: Joi.string().required().messages({
            '*': `status ${langFunction("en", "feildmissing")}`
        }),

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
      let con = {
        status:userData.status.toUpperCase(),
        user:req.doc.id,
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
 * @function  InvoicePdf
 * @description API Will be /api/v1/u/order/getInvoice/:id
 */

 router.get("/getInvoice/:id", async (req, res) => {

  let id = req.params.id
  try {
    let examsArr = [];
    let packageArr = [];
    let isInr = null

    let orderData = await Order.findOne({ _id: id }).populate(['user', { path: 'exams.examId' }, { path: 'packages.packageId' }

    ])
    if (orderData.exams) {
      examsArr = JSON.parse(JSON.stringify(orderData.exams))
    }
    if (orderData.packages) {
      packageArr = JSON.parse(JSON.stringify(orderData.packages))
    }
    if (orderData.currency == 'inr') {
      isInr = true
    }
    else {
      isInr = false
    }
    // console.log(JSON.stringify(orderData.exams))


    let htmlPath = path.join(
      __dirname,
      `../../common-modules/invoiceTemplate/invoice.html`
    );
    let readFile = fs.readFileSync(htmlPath, "utf-8");

    const template = hbs.compile(readFile);

    const html = template({
      invoiceNo: orderData.invoiceNumber,
      createdAt: new Date(orderData.createdAt).toLocaleDateString('en-GB'),
      user: orderData.user.name,
      email: orderData.user.email,
      examsArr: examsArr,
      packageArr: packageArr,
      grandTotal: orderData.grandTotal,
      couponDeduction: orderData.couponDeduction,
      subTotal: orderData.subTotal,
      isInr: isInr


    });

    // res.send(html);
    let responsePdf = await CMS.pdfCreation.PdfLetterHead(html);

    if (responsePdf) {
      let url = `${process.env.PDF_BASE_URL}${responsePdf.fileName}`;
      return res.status(200).json({
          message: CMS.Lang_Messages("en", "success"),
          data: url
        });
    } else {
      return res.status(400).json({
        message: CMS.Lang_Messages("en", "servererr"),
      });
    }

  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: CMS.Lang_Messages("en", "servererr"),
    });
  }
});

module.exports = router;
