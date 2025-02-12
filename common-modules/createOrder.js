const langFunction = require("./lang-messages");
const Subscription = require("../models/subscriptionPlan");
const Order = require("../models/order");
const Joi = require("joi");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Email = require("./email");
const Customer = require("../models/customer");
const SubsHistory = require("../models/subsHistory");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const SMS = require("./sms");

async function createOrder(userData, userAuthId) {
  try {
    const user = await Customer.findOne({_id: userAuthId}, "currentPlan isPlanActive");
    const currentPlan = await Subscription.findOne({_id: user.currentPlan});

    const plan = await Subscription.findOne({_id: userData.plan});
    if (!plan) {
      return {status: 400, msg: langFunction("en", "planNotExist")}
    }


    let id = "INV-" + String(await Order.countDocuments({})).padStart(7, "0");
    let newOrder;

    newOrder = await Order({
      orderId: id,
      invoiceNumber: id,
      user: userAuthId,
      plan: userData.plan,
      status: "DRAFT",
      paymentDetails: {},
    });

    if(user.isPlanActive === false) {
      newOrder.activationDate = new Date().toISOString();
    }
    else if(user.isPlanActive === true && currentPlan.oneTimePlan === true && plan.oneTimePlan === true) {
      newOrder.activationDate = null;
    }
    else {
      return {status: 400, msg: "Cannot buy additional plans."}
    }

    let doc = await newOrder.save();
    return {status: 200, msg: langFunction("en", "success"), data: doc};

  } catch (error) {
    console.error(error);
    return {status: 400, msg: langFunction("en", "servererr")}
  }
}

async function makePayment(userData, req) {
  let successUrl = "";
  let cancelUrl = "";
  if(userData.path){
    successUrl = req.headers.origin+'/'+userData.path+`?success=true&orderid=${userData.orderId}`;
    cancelUrl = req.headers.origin+'/'+userData.path+`?canceled=true&orderid.lt=${userData.orderId}`;
  }else{
    successUrl = `https://success.com?success=true&orderid=${userData.orderId}`;
    cancelUrl = `https://cancel.com?canceled=true&orderid.lt=${userData.orderId}`;
  }

  try {
    let validator = Joi.object({
      orderId: Joi.string()
        .required()
        .messages({
          "*": `orderId ${langFunction("en", "feildmissing")}`,
        }),
        path: Joi.string()
        .required()
        .messages({
          "*": `path ${langFunction("en", "feildmissing")}`,
        }),
    });
    let { error } = validator.validate(userData);
    if (error) {
      return {status: 400, msg: error.details[0].message}
    }

    let order = await Order.findOne({ _id: userData.orderId }).populate("plan").lean();
    if (order.status === "DRAFT" || order.status === "PENDING") {
      let interval;

      switch(order.plan.planType.toLowerCase()){
        case "monthly": interval = "month"
          break;
        case "weekly": interval = "week"
          break;
        case "annually": interval = "year"
      }

      let transformedItem;
      transformedItem = {
        price_data: {
          currency: "usd",
          product_data: {
            name: order.plan.title,
            description: `Duration of the plan: ${order.plan.days} days`,
          },
          unit_amount: parseFloat(order.plan.priceAfterDiscount) * 100,
        },
        quantity: 1,
      };

      if(!order.plan.oneTimePlan) {
        transformedItem.price_data.recurring = {interval};
      }



      let session = await stripe.checkout.sessions.create({
        billing_address_collection: "auto",
        shipping_address_collection: {
          allowed_countries: ["US"],
        },
        payment_method_types: ["card"],
        line_items: [transformedItem],
        mode: order.plan.oneTimePlan === false ? "subscription" : "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      await Order.updateOne(
        {
          _id: userData.orderId,
        },
        {
          $set: {
            stripeSessionid: session.id,
            status: "PENDING",
          },
        }
      );
      return {status: 200, msg: {id: session.id, url: session.url}}
    } else {
      return {status: 400, msg: langFunction("en", "paymentdone")}
    }
  } catch (error) {
    console.log(error.message);
    return {status: 400, msg: langFunction("en", "servererr")}
  }
}

async function checkPayment(userAuthId, paramsId) {
  try {
    let order = await Order.findOne({
      _id: paramsId,
    }).populate("user").populate("plan").lean();
    if (order.status !== "PAID") {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionid);
      // change the current subsId and put old subsId into the old subs array
      if(session.subscription){
        const customer = await Customer.findOne({_id: userAuthId});
        customer.oldStripeSubsId.push(customer.stripeSubsId);
        customer.stripeSubsId = session.subscription;
        await customer.save();
      }

      if (session.payment_status === "paid") {
        const plan = await Subscription.findOne({ _id: order.plan });
        if (!plan) {
          return {status: 400, msg: langFunction("en", "planNotExist")}
        }
        const today=new Date();
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        if(plan.planType === "MONTHLY"){
          tomorrow.setDate(tomorrow.getDate() + 29)
        }else if(plan.planType === "Annually"){
          tomorrow.setDate(tomorrow.getDate() + 364)
        }else if(plan.planType === "Quarterly"){
          tomorrow.setDate(tomorrow.getDate() + 90)
        }else if(plan.planType === "WEEKLY"){
          tomorrow.setDate(tomorrow.getDate() + 6)
        }

        const newSubsHistory = new SubsHistory({
          userId:userAuthId,
          orderId:order._id,
          status: "ACTIVE",
          plan: order.plan,
        });

        if(order.activationDate) {
          newSubsHistory.from = order.activationDate;
          newSubsHistory.to = new Date(moment(order.activationDate).add(plan.days, "days").format());
        }

        await newSubsHistory.save();

        let newOrder = await Order.findOneAndUpdate(
          {
            _id: paramsId,
          },
          {
            $set: {
              stripeSessionid: session.id,
              status: "PAID",
            },
          }, {new: true}
        );

        const user = await Customer.findOne({_id: userAuthId}).populate("currentPlan");
        // if purchased plan's activation date in today
        if(newOrder?.activationDate?.toDateString()?.split(",")[0] === new Date().toDateString().split(",")[0]) {
          await Customer.updateOne(
            {
              _id: userAuthId,
            },
            { $set: { isPlanActive: true, currentPlan: order.plan, activeOrder: newOrder._id } }
          );
        } else if(user.isPlanActive === true && user.currentPlan.oneTimePlan === true && plan.oneTimePlan === true) {
          // if purchased plan is added into advance plans
          await Customer.findOneAndUpdate({_id: userAuthId}, {$push: {advanceOrders: newOrder._id}}, {new: true});
        }

          const isPlanActive = await Customer.findOne({_id: userAuthId}, "isPlanActive");
          let payLoadNew = {
            id: userAuthId,
            isPlanActive
          };
          let tokenNew = jwt.sign(payLoadNew, process.env.ADMIN_KEY, {
            expiresIn: "24h", // expires in 1 Day
          });

        const {priceAfterDiscount: amount, title, days} = await Subscription.findOne({_id: newOrder.plan});
        const expDate = new Date(moment(newOrder.activationDate).add(days, "days").format());
        const smsExpDate = moment(newOrder.activationDate).add(days, "days").format("dddd, Mo MMMM YYYY");
        if(user.email)
          await Email.send_payment_success(userAuthId, amount, expDate, title);
        if(user.phone)
          await SMS.sendSms(user.code+''+user.phone,`Your payment of $${amount} against the subscription plan is successful. Your subscription is valid till ${smsExpDate}`);

        return {
          status: 200,
          stripe_status: session.payment_status,
          msg: langFunction("en", "paymentsuccessful"),
          token: tokenNew
        }
      }
      return {
        status: 200,
        stripe_status: session.payment_status,
        msg: langFunction("en", "paymentfailed")
      }
    } else {
      return {status: 400, msg: langFunction('en', 'paymentdone')}
    }
  } catch (error) {
    console.error(error);
    return {status: 400, msg: langFunction("en", "servererr")}
  }
}

async function cancel(userAuthId) {
  try {
    const {activeOrder, stripeSubsId} = await Customer.findOne({_id: userAuthId}, "activeOrder stripeSubsId");

    if(activeOrder) {
      const currentOrder = await Order.findOne({_id: activeOrder});
      const currentPlan = await Subscription.findOne({_id: currentOrder.plan});
      if(currentPlan.oneTimePlan == false) {
        await stripe.subscriptions.update(stripeSubsId, {cancel_at_period_end: true});
        await Order.updateOne({_id: currentOrder}, {isMarkedForCancellation: true});
        await Email.send_cancel_success(userAuthId);
        return {status: 200, msg: langFunction("en", "subscancelled")};
      }
    }
    return {status: 200, msg: langFunction("en", "subsnotcancelable")};
  } catch (error) {
    console.error(error);
    return {status: 400, msg: langFunction("en", "servererr")};
  }
}

module.exports = {createOrder, makePayment, cancel, checkPayment};
