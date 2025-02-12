// const cron = require("node-cron");
const Customer = require("../models/customer");
const Order = require("../models/order");
const Subscription = require("../models/subscriptionPlan");
const moment = require("moment-timezone")
const cron = require("node-cron");
const reminderBeforeDays = 5;
const Email = require("./email");
const SMS = require("./sms");

// deactivation of one time plans runs every minute
cron.schedule("*/1 * * * *", async () => {
  try {
    const customers = await Customer.find({ isPlanActive: true }, "currentPlan advanceOrders activeOrder");

    for (let customer of customers) {
      const currentOneTimePlan = await Subscription.findOne({
        _id: customer.currentPlan,
        oneTimePlan: true,
      });

      const order = await Order.findOne({_id: customer.activeOrder});
      if(currentOneTimePlan && order) {
        // console.log("customer",customer)
        const expDate = new Date(moment(order.activationDate).add(currentOneTimePlan.days, "days").format())

        // check expiration time with current time
        if((Math.floor((expDate - new Date(moment().format())) / 60000)) === 0) { // "2022-11-02T03:00:00.00Z"
          // if no advance orders, deactivate subscription
          if(customer.advanceOrders.length === 0)
            await Customer.updateOne({_id: customer._id}, {isPlanActive: false, currentPlan: null, activeOrder: null});
          else {
            // if advance orders, update user subscription
            const nextOrder = await Order.findOne({_id: customer.advanceOrders[0]});
            nextOrder.activationDate = new Date().toISOString();
            await nextOrder.save();
            const newPlan = await Subscription.findOne({_id: nextOrder.plan}).lean();
            await Customer.updateOne({_id: customer._id}, {currentPlan: newPlan._id, activeOrder: nextOrder._id, $pop: {advanceOrders: -1}});
          }
        }
      } else {
        const currentSubsPlan = await Subscription.findOne({_id: customer.currentPlan, oneTimePlan: false});
        if(currentSubsPlan && order) {
          if(order.isMarkedForCancellation) {
            const expDate = new Date(moment(order.activationDate).add(currentSubsPlan.days, "days").format());
            if ((Math.floor((expDate - new Date(moment().format())) / 60000)) === 0) {
              await Customer.updateOne({_id: customer._id}, {
                isPlanActive: false,
                currentPlan: null,
                activeOrder: null
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// expiration reminders runs every day
cron.schedule("0 1 * * *", async () => {
// async function test() {
  try {
    const customers = await Customer.find({isPlanActive: true}, "currentPlan activeOrder code phone email");

    for (let customer of customers) {
      const plan = await Subscription.findOne({_id: customer.currentPlan, oneTimePlan: true});
      const order = await Order.findOne({_id: customer.activeOrder});

      if (plan && order) {
        const expDate = new Date(moment(order.activationDate).add(plan.days, "days").format())
        const smsExpDate = moment(order.activationDate).add(plan.days, "days").format("dddd, Mo MMMM YYYY");

        // check expiration time with current time
        if ((Math.floor((expDate - new Date()) / 8.64e+7)) === reminderBeforeDays) {
          if (customer.phone)
            await SMS.sendSms(customer.code + '' + customer.phone, `A friendly reminder that your membership at Christian Roommate is about to expire on ${smsExpDate}`);
          if (customer.email)
            await Email.send_SubscriptionExpiredSoon_email(customer._id, smsExpDate);

        }
      } else if (order?.isMarkedForCancellation) {
        const plan = await Subscription.findOne({_id: customer.currentPlan, oneTimePlan: false});
        const expDate = new Date(moment(order.activationDate).add(plan.days, "days").format());
        const smsExpDate = moment(order.activationDate).add(plan.days, "days").format("dddd, Mo MMMM YYYY");

        // check expiration time with current time
        if ((Math.floor((expDate - new Date()) / 8.64e+7)) === reminderBeforeDays) {
          if (customer.email)
            await Email.send_SubscriptionExpiredSoon_email(customer._id, smsExpDate);
          if (customer.phone)
            await SMS.sendSms(customer.code + '' + customer.phone, `A friendly reminder that your membership at Christian Roommate is about to expire on ${smsExpDate}`)
        }
      } else {
        const plan = await Subscription.findOne({_id: customer.currentPlan, oneTimePlan: false});
        const expDate = new Date(moment(order.activationDate).add(plan.days, "days").format());
        const smsExpDate = moment(order.activationDate).add(plan.days, "days").format("dddd, Mo MMMM YYYY");

        if (plan) {
          // check expiration time with current time
          if ((Math.floor((expDate - new Date()) / 8.64e+7)) === reminderBeforeDays) {
            console.log(customer);
            if (customer.email)
              await Email.send_auto_renew(customer._id, smsExpDate);
            if (customer.phone)
              await SMS.sendSms(customer.code + '' + customer.phone, `A friendly reminder that your membership at Christian Roommate is set for renewal on ${smsExpDate}`)
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
// }
// test();
});
