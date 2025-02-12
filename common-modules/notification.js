const Notification = require("../models/notification");

async function createNotification(data) { 
  try {
    let newNotification = new Notification();
    newNotification.title = data.title;
    newNotification.description = data.description;
    newNotification.userType = data.userType; // admin ,customer,vendor,serviceProvider
    if (data.productId) {
      newNotification.productId = data.productId;
    }

    if (data.orderId) {
      newNotification.orderId = data.orderId;
    }
    if (data.serviceProviderId) {
      newNotification.serviceProviderId = data.serviceProviderId;
    }
    if (data.customerId) {
      newNotification.customerId = data.customerId;
    }
    if (data.vendorId) {
      newNotification.vendorId = data.vendorId;
    }
    if (data.adminId) {
      newNotification.adminId = data.adminId;
    }

    return await newNotification.save();
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

async function getlatestNotification(userType, userid) {
  try {
    return await Notification.find({
      isRead: false,
      userType: userType,
      adminId: userid,
    })
      .sort({ _id: -1 })
      .limit(10);
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

async function markAsRead(userType, id) {
  return await Notification.updateOne(
    { _id: id, userType: userType },
    {
      $set: {
        isRead: true,
      },
    }
  );
}

async function markAllReadAdmin(adminId) {
  return await Notification.updateMany(
    { userType: "admin", adminId: adminId },
    {
      $set: {
        isRead: true,
      },
    }
  );
}

async function markAllRead(userType, id) {
  return await Notification.updateMany(
    { userType: userType, userId: id },
    {
      $set: {
        isRead: true,
        userType: userType,
      },
    }
  );
}

module.exports = {
  createNotification,
  getlatestNotification,
  markAsRead,
  markAllRead,
  markAllReadAdmin,
};
