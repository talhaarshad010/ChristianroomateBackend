const config = require('./config');
const Vendor = require('../models/vendor');
const Admin = require('../models/admin');
const Transactions = require('../models/transaction');
const Information = require('../models/information');
const Customer = require('../models/customer');
const ServiceProvider = require('../models/serviceProvider');


// DR -- DEBIT whats comes in
// CR -- Credit whats goes out
let accountModule = {

  addToVendor: async (data) => {

    try {
      //  add entry for users 
      //  add user balance
      //  this will be used to for when order is complete and money needs to be transfer to other hosts
      // 
      let lastTxn = (await Transactions.find({
        userId: data.userId
      }).limit(1).sort({
        createdAt: -1
      }))[0];
      let oldBalance = 0
      if (lastTxn) {
        oldBalance = lastTxn.balance;
      }
      let txn = new Transactions();
      txn.remarks = data.remarks
    
      txn.txnType = 'DR'
      txn.amountIn = data.amountIn || 0
      txn.amountOut = 0
      txn.balance = oldBalance + parseFloat(data.amountIn)
      txn.userId = data.userId
      txn.userType = 'VENDOR'
      txn.vendorId=data.userId
      let newTxn = await txn.save();

      await Vendor.updateOne({
        _id: newTxn.userId
      }, {
        $inc: {
          balance: parseFloat(data.amountIn)
        }
      }, {
        upsert: true
      })

      return newTxn
    } catch (error) {
      throw error
    }
  },
  payFromVendor: async function (data) {

    try {
      //  add entry for users 
      //  add user balance
      //  this will be used to for when order is complete and money needs to be transfer to other hosts
      //  
      let lastTxn = (await Transactions.find({
        userId: data.userId
      }).limit(1).sort({
        createdAt: -1
      }))[0];
      let oldBalance = 0
      if (lastTxn) {
        oldBalance = lastTxn.balance;
      }
      let txn = new Transactions();
      txn.remarks = data.remarks
     
      txn.txnType = 'CR'
      txn.amountIn = 0
      txn.amountOut = data.amountOut
      txn.balance = oldBalance - parseFloat(data.amountOut)
      txn.userId = data.userId
      txn.userType = 'VENDOR'
      txn.vendorId=data.userId
      let newTxn = await txn.save();

      await Vendor.updateOne({
        _id: newTxn.userId
      }, {
        $inc: {
          balance: (parseFloat(data.amountOut) * -1)
        }
      }, {
        upsert: true
      })

      return newTxn
    } catch (error) {
      throw error
    }
  },
  addToAdmin: async function (data) {
    try {
      //  add entry for users 
      //  add user balance
      //  this will be used to for when order is complete and money needs to be transfer to other hosts
      // 
      let lastTxn = (await Transactions.find({
        userId: data.userId
      }).limit(1).sort({
        createdAt: -1
      }))[0];
      let oldBalance = 0
      if (lastTxn) {
        oldBalance = lastTxn.balance;
      }
      let txn = new Transactions();
      txn.remarks = data.remarks
      //inc or dec ac to  infornation 
      txn.txnType = 'DR'
      txn.amountIn = data.amountIn || 0
      txn.amountOut = 0
      txn.balance = oldBalance + parseFloat(data.amountIn)
      txn.userId = data.userId
      txn.userType = 'ADMIN'
      let newTxn = await txn.save();

      await Information.updateOne({
       key: "admin_balance"
      }, {
        $inc: {
          numberValue: parseFloat(data.amountIn)
        }
      }, {
        upsert: true
      })

      return newTxn
    } catch (error) {
      throw error
    }
  },
  payFromAdmin: async function (data) {
    try {
      //  add entry for users 
      //  add user balance
      //  this will be used to for when order is complete and money needs to be transfer to other hosts
      // 
      let lastTxn = (await Transactions.find({
        userId: data.userId
      }).limit(1).sort({
        createdAt: -1
      }))[0];
      let oldBalance = 0
      if (lastTxn) {
        oldBalance = lastTxn.balance;
      }
      let txn = new Transactions();
      txn.remarks = data.remarks
     
      txn.txnType = 'CR'
      txn.amountIn = 0
      txn.amountOut = data.amountOut || 0
      txn.balance = oldBalance - parseFloat(data.amountOut)
      txn.userId = data.userId
      txn.userType = 'ADMIN'
      let newTxn = await txn.save();

      await Information.updateOne({
        key: "admin_balance"
      }, {
        $inc: {
          numberValue: (parseFloat(data.amountOut) * -1)
        }
      }, {
        upsert: true
      })

      return newTxn
    } catch (error) {
      throw error
    }
  },
  addToServiceProvider: async (data) => {

    try {
      //  add entry for users 
      //  add user balance
      //  this will be used to for when order is complete and money needs to be transfer to other hosts
      // 
      let lastTxn = (await Transactions.find({
        userId: data.userId
      }).limit(1).sort({
        createdAt: -1
      }))[0];
      let oldBalance = 0
      if (lastTxn) {
        oldBalance = lastTxn.balance;
      }
      let txn = new Transactions();
      txn.remarks = data.remarks
    
      txn.txnType = 'DR'
      txn.amountIn = data.amountIn || 0
      txn.amountOut = 0
      txn.balance = oldBalance + parseFloat(data.amountIn)
      txn.userId = data.userId
      txn.userType = 'SERVICEPROVIDER'
      txn.SPId=data.userId
      let newTxn = await txn.save();

      await ServiceProvider.updateOne({
        _id: newTxn.userId
      }, {
        $inc: {
          balance: parseFloat(data.amountIn)
        }
      }, {
        upsert: true
      })

      return newTxn
    } catch (error) {
      throw error
    }
  },
  payFromServiceProvider: async function (data) {

    try {
      //  add entry for users 
      //  add user balance
      //  this will be used to for when order is complete and money needs to be transfer to other hosts
      //  
      let lastTxn = (await Transactions.find({
        userId: data.userId
      }).limit(1).sort({
        createdAt: -1
      }))[0];
      let oldBalance = 0
      if (lastTxn) {
        oldBalance = lastTxn.balance;
      }
      let txn = new Transactions();
      txn.remarks = data.remarks
     
      txn.txnType = 'CR'
      txn.amountIn = 0
      txn.amountOut = data.amountOut
      txn.balance = oldBalance - parseFloat(data.amountOut)
      txn.userId = data.userId
      txn.userType = 'SERVICEPROVIDER'
      txn.SPId=data.userId
      let newTxn = await txn.save();

      await ServiceProvider.updateOne({
        _id: newTxn.userId
      }, {
        $inc: {
          balance: (parseFloat(data.amountOut) * -1)
        }
      }, {
        upsert: true
      })

      return newTxn
    } catch (error) {
      throw error
    }
  },

}





module.exports = accountModule;