const express = require("express");
const router = express.Router();
const Customer = require("../../models/customer");
const Property = require("../../models/property");
const Tenant = require("../../models/tenant");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const stripe = require("stripe")(process.env.STRIPE_KEY);

/**
 * @function  myProfile
 * @description API Will be /api/v1/c/myProfile
 * @example myProfile
 */

// router.get("/myProfile", async (req, res) => {
//   try {
//     let user = await Customer.findOne({
//       _id: req.doc.id,
//     }).populate(["image","galleryImage", "currentPlan"])

//     return res.status(200).json({
//       message: langFunction("en", "success"),
//       data: user,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({
//       message: langFunction("en", "servererr"),
//     });
//   }
// });

/**
 * @function  myProfile
 * @description API Will be /api/v1/c/getUser/:id
 * @example myProfile
 */

router.get("/getUser/:id", async (req, res) => {
  try {
    const user = await Customer.findOne({ _id: req.params.id }).populate(
      "image"
    );
    res
      .status(200)
      .json({ message: langFunction("en", "success"), data: user });
  } catch (e) {
    res.status(400).json({ message: langFunction("en", "servererr") });
  }
});

/**
 * @function  GET_BankDetails
 * @description API Will be /api/v1/c/get/BankDetails
 * @example GET_BankDetails
 */

router.get("/get/BankDetails", async (req, res) => {
  try {
    const bankData = await Customer.findOne({
      _id: req.doc.id,
    });
    if (!bankData) {
      return res.status(400).json({
        message: langFunction("en", "customernotfound"),
      });
    }
    return res.status(200).json({
      data: bankData.bankDetails,
    });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  Bank_Update
 * @description API Will be /api/v1/c/update/bankDetails
 * @example Bank_Update
 */

router.post("/update/bankDetails", async (req, res) => {
  const userData = req.body;

  const bankScehma = Joi.object({
    bankName: Joi.string()
      .required()
      .messages({
        "*": `bankName ${langFunction("en", "fieldmissing")}`,
      }),
    branch: Joi.string()
      .required()
      .messages({
        "*": `branch ${langFunction("en", "fieldmissing")}`,
      }),
    accountNumber: Joi.string()
      .required()
      .messages({
        "*": `accountNumber ${langFunction("en", "fieldmissing")}`,
      }),
    accountType: Joi.string()
      .required()
      .messages({
        "*": `accountType ${langFunction("en", "fieldmissing")}`,
      }),
    ifscCode: Joi.string()
      .required()
      .messages({
        "*": `ifscCode ${langFunction("en", "fieldmissing")}`,
      }),
    country: Joi.string()
      .required()
      .messages({
        "*": `ifscCode ${langFunction("en", "fieldmissing")}`,
      }),
  });

  const { error } = bankScehma.validate(userData);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      error,
    });
  }

  try {
    let user = await Customer.updateOne(
      {
        _id: req.doc.id,
      },
      {
        $set: {
          bankDetails: {
            bankName: userData.bankName,
            branch: userData.branch,
            accountNumber: userData.accountNumber,
            accountType: userData.accountType,
            ifscCode: userData.ifscCode,
            country: userData.country,
          },
        },
      },
      {
        upsert: true,
      }
    );

    return res.status(200).json({
      message: langFunction("en", "dataupdated"),
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  Customer_Update
 * @description API Will be /api/v1/c/update
 * @example Customer_Update
 */

router.post("/update", async (req, res) => {
  try {
    let userData = req.body;
    console.log(userData, "email", req.email);
    let validator = Joi.object({
      name: Joi.string()
        .required()
        .messages({
          "*": `firstName ${langFunction("en", "feildmissing")}`,
        }),
      // username: Joi.string()
      //   .required()
      //   .messages({
      //     "*": `lastName ${langFunction("en", "feildmissing")}`,
      //   }),
      image: Joi.string().allow("", null),
      galleryImage: Joi.array().allow("", null),
      code: Joi.string(),
      phone: Joi.string(),
      email: Joi.string(),
      gender: Joi.string(),
      age: Joi.number(),
      country: Joi.string()
        .required()
        .messages({
          "*": `Country ${langFunction("en", "feildmissing")}`,
        }),
      state: Joi.string()
        .required()
        .messages({
          "*": `State ${langFunction("en", "feildmissing")}`,
        }),
      occupation: Joi.string(),
      smoker: Joi.boolean(),
      pet: Joi.string(),
      UserTypePreference: Joi.string().messages({
        "*": `User Type ${langFunction("en", "feildmissing")}`,
      }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
        newMessage: error.name,
      });
    }

    delete userData.code;
    delete userData.phone;
    delete userData.email;

    if (userData.username) {
      delete userData.username;
    }

    let data = await Customer.updateOne(
      { _id: req.doc.id },
      { ...userData, gender: userData.gender.toUpperCase() },
      { upsert: true }
    );
    console.log("IDDDDD", req.doc.id);
    return res.status(200).json({
      message: langFunction("en", "userupdated"),
      data: userData,
      mess: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
      langmessage: error.message,
    });
  }
});

/**
 * @function  Toggle_Visibility
 * @description API Will be /api/v1/c/toggleVisibility
 * @example Customer_Update
 */

router.post("/toggleVisibility", async (req, res) => {
  try {
    await Customer.updateOne(
      { _id: req.doc.id },
      { visibility: req.body.visibility }
    );
    await Property.updateMany(
      { user: req.doc.id },
      { visibility: req.body.visibility }
    );
    await Tenant.updateMany(
      { user: req.doc.id },
      { visibility: req.body.visibility }
    );
    if (req.body.visibility == true) {
      res
        .status(200)
        .json({ message: langFunction("en", "profileVisibilityTrue") });
    } else if (req.body.visibility == false) {
      res
        .status(200)
        .json({ message: langFunction("en", "profileVisibilityFalse") });
    }
  } catch (e) {
    res.status(400).json({ message: langFunction("en", "servererr") });
  }
});

/**
 * @function  Delete_Profile
 * @description API Will be /api/v1/c/delete
 * @example Toggle_Visibility
 */

router.post("/delete", async (req, res) => {
  try {
    await Customer.updateOne({ _id: req.doc.id }, { isDeleted: true });
    await Property.updateMany({ user: req.doc.id }, { userDeleted: true });
    await Tenant.updateMany({ user: req.doc.id }, { userDeleted: true });
    const user = await Customer.findOne(
      { _id: req.doc.id },
      "activeOrder stripeSubsId currentPlan"
    ).populate("currentPlan");
    console.log(user);
    if (
      user.activeOrder &&
      user.stripeSubsId &&
      user.currentPlan.oneTimePlan == false
    ) {
      await stripe.subscriptions.update(user.stripeSubsId, {
        cancel_at_period_end: true,
      });
    }
    res.status(200).json({ message: langFunction("en", "userdeleted") });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: langFunction("en", "servererr") });
  }
});

/**
 * @function  changePassword
 * @description API Will be /api/v1/c/changePassword
 * @example changePassword
 */

router.post("/changePassword", async (req, res) => {
  try {
    let userData = req.body;

    let validator = Joi.object({
      oldPassword: Joi.string()
        .required()
        .messages({
          "*": `oldPassword ${langFunction("en", "feildmissing")}`,
        }),
      newPassword: Joi.string()
        .required()
        .messages({
          "*": `newPassword ${langFunction("en", "feildmissing")}`,
        }),
      confirmPassword: Joi.string()
        .required()
        .messages({
          "*": `confirmPassword ${langFunction("en", "feildmissing")}`,
        }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    if (userData.newPassword !== userData.confirmPassword) {
      return res.status(400).json({
        message: langFunction("en", "confirmpassword"),
      });
    }
    let customer = await Customer.findOne({ _id: req.doc.id }).select(
      "+password"
    );
    if (customer) {
      const validpwd = await bcrypt.compare(
        userData.oldPassword,
        customer.password
      );
      if (!validpwd) {
        return res.status(400).json({
          message: langFunction("en", "wrngoldpass"),
        });
      }

      const currentPassHash = await Customer.findOne(
        { _id: req.doc.id },
        "password"
      ).lean();
      let isPassSame = await bcrypt.compare(
        userData.confirmPassword,
        currentPassHash.password
      );
      if (isPassSame) {
        return res.status(400).json({
          message: CM.Lang_Messages("en", "notSamePassword"),
        });
      }

      const salt = bcrypt.genSaltSync(10);
      let hash = await bcrypt.hash(userData.newPassword, salt);
      customer.password = hash;
      customer.save();
      return res.status(200).json({
        message: langFunction("en", "customerpassupdated"),
        data: customer,
      });
    } else {
      return res.status(400).json({
        message: langFunction("en", "customernotfound"),
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
