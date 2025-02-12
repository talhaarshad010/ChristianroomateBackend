/** @format */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Customer = require("../../models/customer");
const Otp = require("../../models/otp");
const config = require("../../common-modules/config");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const SMS = require("../../common-modules/sms");
const Email = require("../../common-modules/email");

/**
 * @function  Customer_sendotp
 * @description API Will be /api/v1/c/login/email
 * @example Customer_sendotp
 */

router.post("/login/email", async (req, res) => {
  try {
    let userData = req.body;

    let validator = Joi.object({
      email: Joi.string()
        .required()
        .messages({
          "*": `email ${langFunction("en", "feildmissing")}`,
        }),
      password: Joi.string()
        .required()
        .messages({
          "*": `password ${langFunction("en", "feildmissing")}`,
        }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    if (!config.emailvalidator(userData.email)) {
      return res.status(400).json({
        message: langFunction("en", "emailnotmatch"),
      });
    }

    let responseBody = {
      name: "",
      _id: "",
      email: "",
      image: "",
      token: "",
    };
    let user = await Customer.findOne({
      email: userData.email,
      isDeleted: false,
    }).select("+password");
    if (!user) {
      return res.status(400).json({
        ...responseBody,
        message: langFunction("en", "userNotRegistered"),
      });
    }

    if (user?.enabled == false) {
      return res
        .status(400)
        .json({ message: langFunction("en", "userDisabled") });
    }

    if (user.isDeleted == true) {
      return res
        .status(400)
        .json({ message: langFunction("en", "profiledeleted") });
    }

    let verify = await bcrypt.compare(userData.password, user.password);
    if (!verify) {
      return res.status(400).json({
        message: langFunction("en", "wrngpass"),
      });
    }
    if (user.status != "VERIFIED") {
      return res.status(400).json({
        message: langFunction("en", "notverified"),
        type: "OTP",
      });
    }
    let payLoad = {
      id: user._id,
      isPlanActive: user.isPlanActive,
    };
    let token = jwt.sign(payLoad, process.env.ADMIN_KEY, {
      expiresIn: "24h", // expires in 1 Day
    });
    return res.status(200).json({
      ...responseBody,
      name: user.name,
      email: user.email,
      _id: user._id,
      image: user.image,
      message: langFunction("en", "loginsuccess"),
      token: token,
      UserTypePreference: user.UserTypePreference,
      isPlanActive: user.isPlanActive,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  Customer_sendotp
 * @description API Will be /api/v1/c/login/email
 * @example Customer_sendotp
 */

router.post("/login/phone", async (req, res) => {
  try {
    let userData = req.body;

    let validator = Joi.object({
      code: Joi.string()
        .required()
        .messages({
          "*": `code ${langFunction("en", "feildmissing")}`,
        }),
      phone: Joi.string()
        .required()
        .messages({
          "*": `phone ${langFunction("en", "feildmissing")}`,
        }),
      password: Joi.string()
        .required()
        .messages({
          "*": `password ${langFunction("en", "feildmissing")}`,
        }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    let responseBody = {
      name: "",
      _id: "",
      code: "",
      phone: "",
      image: "",
      token: "",
    };
    let user = await Customer.findOne({
      code: userData.code,
      phone: userData.phone,
      isDeleted: false,
    }).select("+password");
    if (!user) {
      return res.status(400).json({
        message: langFunction("en", "userNotRegisteredPhone"),
      });
    }

    if (user?.enabled == false) {
      return res
        .status(400)
        .json({ message: langFunction("en", "userDisabled") });
    }

    if (user.isDeleted == true) {
      return res
        .status(400)
        .json({ message: langFunction("en", "profiledeleted") });
    }

    let verify = await bcrypt.compare(userData.password, user.password);
    if (!verify) {
      return res.status(400).json({
        message: langFunction("en", "wrngpass"),
      });
    }
    if (user.status != "VERIFIED") {
      return res.status(400).json({
        message: langFunction("en", "notverified"),
        type: "OTP",
      });
    }
    let payLoad = {
      id: user._id,
      isPlanActive: user.isPlanActive,
    };
    let token = jwt.sign(payLoad, process.env.ADMIN_KEY, {
      expiresIn: "24h", // expires in 1 Day
    });
    return res.status(200).json({
      ...responseBody,
      name: user.name,
      code: user.code,
      phone: user.phone,
      _id: user._id,
      image: user.image,
      message: langFunction("en", "loginsuccess"),
      token: token,
      UserTypePreference: user.UserTypePreference,
      isPlanActive: user.isPlanActive,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  Customer_Verifyotp
 * @description API Will be /api/v1/c/signup/phone/verifyotp
 * @example Customer_Verifyotp
 */

router.post("/signup/phone/verifyotp", async (req, res) => {
  try {
    let userData = req.body;
    let validator = Joi.object({
      phone: Joi.string()
        .required()
        .messages({
          "*": `phone ${langFunction("en", "feildmissing")}`,
        }),
      otp: Joi.string()
        .required()
        .messages({
          "*": `otp ${langFunction("en", "feildmissing")}`,
        }),
      code: Joi.string()
        .required()
        .messages({
          "*": `code ${langFunction("en", "feildmissing")}`,
        }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    let otpData = await Otp.findOne({ phone: userData.phone }).sort({
      createdAt: -1,
    });
    console.log("Code", otpData);
    if (!otpData) {
      return res.status(400).json({
        message: langFunction("en", "otpexpired"),
      });
    } else if (otpData.otp != userData.otp) {
      return res.status(400).json({
        message: langFunction("en", "wrongotp"),
      });
    }

    let customer = await Customer.findOne({
      code: userData.code,
      phone: userData.phone,
      isDeleted: false,
    });
    console.log("CUSTOMER", customer);
    if (!customer) {
      return res.status(200).json({
        message: langFunction("en", "otpnotverified"),
      });
    } else {
      let payLoad = {
        id: customer._id,
        // "isPlanActive":customer.isPlanActive,
      };
      await Customer.updateOne(
        {
          _id: customer._id,
        },
        {
          status: "VERIFIED",
        },
        {
          upsert: true,
        }
      );
      let token = jwt.sign(payLoad, process.env.ADMIN_KEY, {
        expiresIn: "2h", // expires in 1 Day
      });
      customer._doc.token = token;

      return res.status(200).json({
        message: langFunction("en", "otpverified"),
        data: customer,
        VERRRRR: "OKOKOK",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  Customer_Signup
 * @description API Will be /api/v1/c/signup/phone
 * @example Customer_Signups
 */
router.post("/signup/phone", async (req, res) => {
  try {
    let userData = req.body;
    let validator = Joi.object({
      name: Joi.string()
        .required()
        .messages({
          "*": `name ${langFunction("en", "feildmissing")}`,
        }),
      username: Joi.string()
        .required()
        .messages({
          "*": `username ${langFunction("en", "feildmissing")}`,
        }),
      code: Joi.string()
        .required()
        .messages({
          "*": `code ${langFunction("en", "feildmissing")}`,
        }),
      phone: Joi.string()
        .required()
        .messages({
          "*": `phone ${langFunction("en", "feildmissing")}`,
        }),
      password: Joi.string()
        .required()
        .messages({
          "*": `password ${langFunction("en", "feildmissing")}`,
        }),
      country: Joi.string()
        .required()
        .messages({
          "*": `country ${langFunction("en", "feildmissing")}`,
        }),
      state: Joi.string()
        .required()
        .messages({
          "*": `state ${langFunction("en", "feildmissing")}`,
        }),
    });
    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }
    let user = await Customer.findOne({
      code: userData.code,
      phone: userData.phone,
      isDeleted: false,
    });
    if (user) {
      return res.status(400).json({
        message: langFunction("en", "accountcreatealready"),
      });
    }
    let checkUserName = await Customer.findOne({
      username: userData.username,
      isDeleted: false,
    });
    if (checkUserName) {
      return res.status(400).json({
        message: langFunction("en", "usernamealready"),
      });
    }
    const salt = bcrypt.genSaltSync(10);
    let hash = await bcrypt.hash(userData.password, salt);
    let newCustomer = new Customer();
    newCustomer.name = userData.name;
    newCustomer.username = userData.username;
    newCustomer.code = userData.code;
    newCustomer.phone = userData.phone;
    newCustomer.isPhoneVerified = true;
    newCustomer.password = hash;
    newCustomer.country = userData.country;
    newCustomer.state = userData.state;
    newCustomer.status = "NOT-VERIFIED";
    // newCustomer.occupation = '';
    // newCustomer.smoker = '';
    // newCustomer.UserTypePreference = '';
    // newCustomer.gender = '';
    // newCustomer.pet = '';
    // newCustomer.age = '';
    newCustomer.save(async function (err, user) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          message: err,
        });
      } else {
        let otpCode = Math.floor(1000 + Math.random() * 9000);
        let newOtp = new Otp();
        newOtp.phone = userData.phone;
        newOtp.otp = otpCode;
        newOtp.usedfor = "SIGN-UP";
        const ottp = await newOtp.save();
        console.log("OOOOTTTPPPP", ottp);
        //await CM.SMS(userData.code+''+userData.phone,otpCode + 'is your one time password(OTP) for phone verification');
        const getSMS = await SMS.sendSms(
          userData.code + "" + userData.phone,
          otpCode + " is your one time password(OTP) for phone verification"
        );

        if (getSMS.Failed) {
          return res.status(400).json({
            message: langFunction("en", `${getSMS.error}`),
          });
        }

        return res.status(200).json({
          message: langFunction("en", "otpsentphone"),
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});
// router.post("/signup/phone", async (req, res) => {
//   try {
//     let userData = req.body;
//     let validator = Joi.object({
//       name: Joi.string()
//         .required()
//         .messages({
//           "*": `name ${langFunction("en", "feildmissing")}`,
//         }),
//       username: Joi.string()
//         .required()
//         .messages({
//           "*": `username ${langFunction("en", "feildmissing")}`,
//         }),
//       code: Joi.string()
//         .required()
//         .messages({
//           "*": `code ${langFunction("en", "feildmissing")}`,
//         }),
//       phone: Joi.string()
//         .required()
//         .messages({
//           "*": `phone ${langFunction("en", "feildmissing")}`,
//         }),
//       password: Joi.string()
//         .required()
//         .messages({
//           "*": `password ${langFunction("en", "feildmissing")}`,
//         }),
//       country: Joi.string()
//         .required()
//         .messages({
//           "*": `country ${langFunction("en", "feildmissing")}`,
//         }),
//       state: Joi.string()
//         .required()
//         .messages({
//           "*": `state ${langFunction("en", "feildmissing")}`,
//         }),
//     });

//     let { error } = validator.validate(userData);
//     if (error) {
//       return res.status(400).json({
//         message: error.details[0].message,
//         error,
//       });
//     }

//     let user = await Customer.findOne({
//       code: userData.code,
//       phone: userData.phone,
//       isDeleted: false,
//     });
//     if (user) {
//       return res.status(400).json({
//         message: langFunction("en", "accountcreatealready"),
//       });
//     }
//     let checkUserName = await Customer.findOne({
//       username: userData.username,
//       isDeleted: false,
//     });
//     if (checkUserName) {
//       return res.status(400).json({
//         message: langFunction("en", "usernamealready"),
//       });
//     }

//     const salt = bcrypt.genSaltSync(10);
//     let hash = await bcrypt.hash(userData.password, salt);

//     let newCustomer = new Customer();

//     newCustomer.name = userData.name;
//     newCustomer.username = userData.username;
//     newCustomer.email = userData.email;
//     newCustomer.isEmailVerified = true;
//     newCustomer.password = hash;
//     newCustomer.country = userData.country;
//     newCustomer.state = userData.state;
//     newCustomer.status = "NOT-VERIFIED";
//     // newCustomer.occupation = '';
//     // newCustomer.smoker = '';
//     // newCustomer.UserTypePreference = '';
//     // newCustomer.gender = '';
//     // newCustomer.pet = '';
//     // newCustomer.age = '';

//     newCustomer.save(async function (err, user) {
//       if (err) {
//         console.log(err);
//         return res.status(400).json({
//           message: err,
//         });
//       } else {
//         let otpCode = Math.floor(1000 + Math.random() * 9000);

//         let newOtp = new Otp();
//         newOtp.phone = userData.phone;
//         newOtp.otp = otpCode;
//         newOtp.usedfor = "SIGN-UP";
//         await newOtp.save();

//         //await CM.SMS(userData.code+''+userData.phone,otpCode + 'is your one time password(OTP) for phone verification');
//         await SMS.sendSms(
//           userData.code + "" + userData.phone,
//           otpCode + " is your one time password(OTP) for phone verification"
//         );
//         return res.status(200).json({
//           message: langFunction("en", "otpsentphone"),
//           // "otp": otpCode
//         });
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({
//       message: langFunction("en", "servererr"),
//     });
//   }
// });

/**
 * @function  API_Customer_Resend_Otp
 * @description API Will be /api/v1/c/signup/phone/resendOtp
 * @example API_Customer_Resend_Otp
 */

router.post("/signup/phone/resendOtp", async (req, res) => {
  try {
    let userData = req.body;

    let validator = Joi.object({
      phone: Joi.string()
        .required()
        .messages({
          "*": `phone ${langFunction("en", "feildmissing")}`,
        }),
      code: Joi.string()
        .required()
        .messages({
          "*": `code ${langFunction("en", "feildmissing")}`,
        }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    let otpCode = Math.floor(1000 + Math.random() * 9000);

    let newOtp = new Otp();
    newOtp.phone = userData.phone;
    newOtp.otp = otpCode;
    newOtp.usedfor = "SIGN-UP";
    await newOtp.save();

    await SMS.sendSms(
      userData.code + "" + userData.phone,
      otpCode + "is your one time password(OTP) for phone verification"
    );
    return res.status(200).json({
      message: langFunction("en", "otpsentphone"),
      otp: otpCode,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

// email sign up

/**
 * @function  Customer_Signup
 * @description API Will be /api/v1/c/signup/email
 * @example Customer_Signups
 */

router.post("/signup/email", async (req, res) => {
  try {
    let userData = req.body;
    let validator = Joi.object({
      name: Joi.string()
        .required()
        .messages({
          "*": `name ${langFunction("en", "feildmissing")}`,
        }),
      username: Joi.string()
        .required()
        .messages({
          "*": `username ${langFunction("en", "feildmissing")}`,
        }),
      email: Joi.string()
        .required()
        .messages({
          "*": `email ${langFunction("en", "feildmissing")}`,
        }),
      password: Joi.string()
        .required()
        .messages({
          "*": `password ${langFunction("en", "feildmissing")}`,
        }),
      country: Joi.string()
        .required()
        .messages({
          "*": `country ${langFunction("en", "feildmissing")}`,
        }),
      state: Joi.string()
        .required()
        .messages({
          "*": `state ${langFunction("en", "feildmissing")}`,
        }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    if (!config.emailvalidator(userData.email)) {
      return res.status(400).json({
        message: langFunction("en", "emailnotmatch"),
      });
    }

    let user = await Customer.findOne({
      email: userData.email,
      isDeleted: false,
    });
    if (user) {
      return res.status(400).json({
        message: langFunction("en", "accountcreatealready"),
      });
    }
    let checkUserName = await Customer.findOne({
      username: userData.username,
      isDeleted: false,
    });
    if (checkUserName) {
      return res.status(400).json({
        message: langFunction("en", "usernamealready"),
      });
    }

    const salt = bcrypt.genSaltSync(10);
    let hash = await bcrypt.hash(userData.password, salt);

    let newCustomer = new Customer();

    newCustomer.name = userData.name;
    newCustomer.username = userData.username;
    newCustomer.email = userData.email;
    newCustomer.isEmailVerified = true;
    newCustomer.password = hash;
    newCustomer.country = userData.country;
    newCustomer.state = userData.state;
    newCustomer.status = "NOT-VERIFIED";
    newCustomer.occupation = null;
    newCustomer.smoker = null;
    newCustomer.UserTypePreference = null;
    newCustomer.gender = null;
    newCustomer.pet = null;
    newCustomer.age = null;

    newCustomer.save(async function (err, user) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          message: err,
        });
      } else {
        let otpCode = Math.floor(1000 + Math.random() * 9000);

        let newOtp = new Otp();
        // newOtp.userId = user.userId;
        newOtp.email = userData.email;
        newOtp.otp = otpCode;
        newOtp.usedfor = "SIGN-UP-EMAIL-VERIFICATION";
        await newOtp.save();
        await Email.send_otp_email(user._id, otpCode);
        return res.status(200).json({
          message: langFunction("en", "otpsentEmail"),
          // "otp": otpCode
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  Customer_Verifyotp
 * @description API Will be /api/v1/c/signup/email/verifyotp
 * @example Customer_Verifyotp
 */

router.post("/signup/email/verifyotp", async (req, res) => {
  try {
    let userData = req.body;
    let validator = Joi.object({
      email: Joi.string()
        .required()
        .messages({
          "*": `email ${langFunction("en", "feildmissing")}`,
        }),
      otp: Joi.string()
        .required()
        .messages({
          "*": `otp ${langFunction("en", "feildmissing")}`,
        }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    if (!config.emailvalidator(userData.email)) {
      return res.status(400).json({
        message: langFunction("en", "emailnotmatch"),
      });
    }

    let otpData = await Otp.findOne({ email: userData.email }).sort({
      createdAt: -1,
    });
    if (!otpData) {
      return res.status(400).json({
        message: langFunction("en", "otpexpired"),
      });
    } else if (otpData.otp != userData.otp) {
      return res.status(400).json({
        message: langFunction("en", "wrongotp"),
      });
    }

    let customer = await Customer.findOne({
      email: userData.email,
      isDeleted: false,
    });
    if (!customer) {
      return res.status(200).json({
        message: langFunction("en", "otpverified"),
      });
    } else {
      let payLoad = {
        id: customer._id,
        // "isPlanActive":customer.isPlanActive,
      };
      await Customer.updateOne(
        {
          _id: customer._id,
        },
        {
          status: "VERIFIED",
        },
        {
          upsert: true,
        }
      );
      let token = jwt.sign(payLoad, process.env.ADMIN_KEY, {
        expiresIn: "2h", // expires in 1 Day
      });
      customer._doc.token = token;

      return res.status(200).json({
        message: langFunction("en", "otpverified"),
        data: customer,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  API_Customer_Resend_Otp
 * @description API Will be /api/v1/c/signup/email/resendOtp
 * @example API_Customer_Resend_Otp
 */

router.post("/signup/email/resendOtp", async (req, res) => {
  try {
    let userData = req.body;

    let validator = Joi.object({
      email: Joi.string()
        .required()
        .messages({
          "*": `email ${langFunction("en", "feildmissing")}`,
        }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    if (!config.emailvalidator(userData.email)) {
      return res.status(400).json({
        message: langFunction("en", "emailnotmatch"),
      });
    }

    let otpCode = Math.floor(1000 + Math.random() * 9000);

    let newOtp = new Otp();
    newOtp.email = userData.email;
    newOtp.otp = otpCode;
    newOtp.usedfor = "SIGN-UP-EMAIL-VERIFICATION";
    await newOtp.save();
    let userToVerify = await Customer.findOne({
      email: userData.email,
      isDeleted: false,
    });
    await Email.send_otp_email(userToVerify._id, otpCode);
    return res.status(200).json({
      message: langFunction("en", "otpsentEmail"),
      otp: otpCode,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

/**
 * @function  API_User_forgot_password
 * @description API Will be /api/v1/c/forgotPassword
 * @example Forgot_Password_Request
 */

router.post("/forgotPassword", async (req, res) => {
  try {
    let userData = req.body;

    let otpCode = Math.floor(1000 + Math.random() * 9000);

    let user = await Customer.findOne({
      email: userData.email,
      isDeleted: false,
    });
    if (user) {
      let newOtp = new Otp();
      newOtp.userId = user._id;
      newOtp.otp = otpCode;
      newOtp.usedfor = "FORGOT-USER-PASSWORD";
      await newOtp.save();
      // Email.send_forgotPass_email(user._id, "en", otpCode)

      await Email.send_forgotPass_email(user._id, otpCode);
      return res.status(200).json({
        message: CM.Lang_Messages("en", "otpsentEmail"),
        otp: otpCode,
      });
      // return res.status(200).json({message:""})
    } else {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "usernotfound"),
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

/**
 * @function  API_User_Resend_OTP_Forgot_password
 * @description API Will be /api/v1/c/resend/forgotPassword
 * @example API_User_Resend_OTP
 */

router.post("/resend/forgotPassword", async (req, res) => {
  try {
    let userData = req.body;

    let otpCode = Math.floor(1000 + Math.random() * 9000);

    let user = await Customer.findOne({
      email: userData.email,
    });
    if (user) {
      let newOtp = new Otp();
      newOtp.userId = user._id;
      newOtp.otp = otpCode;
      newOtp.usedfor = "FORGOT-USER-PASSWORD";
      await newOtp.save();

      let userToVerify = await Customer.findOne({
        email: userData.email,
        isDeleted: false,
      });
      await Email.send_forgotPass_email(userToVerify._id, otpCode);
      return res.status(200).json({
        message: CM.Lang_Messages("en", "resetpassword"),
        otp: otpCode,
      });
    } else {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "notFound"),
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

/**
 * @function  API_User_forgot_password
 * @description API Will be /api/v1/c/forgotPassword/phone
 * @example Forgot_Password_Request
 */

router.post("/forgotPassword/phone", async (req, res) => {
  try {
    let userData = req.body;

    let otpCode = Math.floor(1000 + Math.random() * 9000);

    let user = await Customer.findOne({
      code: userData.code,
      phone: userData.phone,
      isDeleted: false,
    });
    if (user) {
      let newOtp = new Otp();
      newOtp.userId = user._id;
      newOtp.otp = otpCode;
      newOtp.usedfor = "FORGOT-USER-PASSWORD";
      await newOtp.save();
      await SMS.sendSms(
        userData.code + "" + userData.phone,
        otpCode + "is your one time password(OTP) for phone verification"
      );
      return res.status(200).json({
        message: CM.Lang_Messages("en", "otpsentphone"),
        otp: otpCode,
      });
      // return res.status(200).json({message:""})
    } else {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "usernotfound"),
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

/**
 * @function  API_User_Resend_OTP_Forgot_password
 * @description API Will be /api/v1/c/resend/forgotPassword/phone
 * @example API_User_Resend_OTP
 */

router.post("/resend/forgotPassword/phone", async (req, res) => {
  try {
    let userData = req.body;

    let otpCode = Math.floor(1000 + Math.random() * 9000);

    let user = await Customer.findOne({
      code: userData.code,
      phone: userData.phone,
      isDeleted: false,
    });
    if (user) {
      let newOtp = new Otp();
      newOtp.userId = user._id;
      newOtp.otp = otpCode;
      newOtp.usedfor = "FORGOT-USER-PASSWORD";
      await newOtp.save();

      await SMS.sendSms(
        userData.code + "" + userData.phone,
        otpCode + "is your one time password(OTP) for phone verification"
      );
      return res.status(200).json({
        message: CM.Lang_Messages("en", "resetpassword"),
        otp: otpCode,
      });
    } else {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "notFound"),
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

/**
 * @function  API_User_Verify_ForgotPassword_OTP
 * @description API Will be /api/v1/c/verifyForgotPassOtp
 * @example API_User_Verify_ForgotPassword_Otp
 */

router.post("/verifyForgotPassOtp", async (req, res) => {
  try {
    let userData = req.body;

    let array1 = ["email", "otp"];
    for (let index = 0; index < array1.length; index++) {
      const element = array1[index];
      if (!userData[element]) {
        return res.status(400).json({
          message: element + CM.Lang_Messages("en", "feildmissing"),
        });
      }
    }

    const user = await Customer.findOne({
      email: userData.email,
      isDeleted: false,
    });
    if (!user) {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "usernotfound"),
      });
    } else {
      let otpData = await Otp.find({
        userId: user._id,
        usedfor: "FORGOT-USER-PASSWORD",
      }).sort({
        createdAt: -1,
      });

      if (!otpData) {
        return res.status(400).json({
          message: CM.Lang_Messages("en", "otpexpired"),
        });
      }
      if (otpData[0].otp == userData.otp) {
        return res.status(200).json({
          message: CM.Lang_Messages("en", "otpverified"),
        });
      } else {
        return res.status(400).json({
          message: CM.Lang_Messages("en", "wrongotp"),
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

/**
 * @function  API_User_Verify_ForgotPassword_OTP
 * @description API Will be /api/v1/c/verifyForgotPassOtp/phone
 * @example API_User_Verify_ForgotPassword_Otp
 */

router.post("/verifyForgotPassOtp/phone", async (req, res) => {
  try {
    let userData = req.body;

    let array1 = ["code", "phone", "otp"];
    for (let index = 0; index < array1.length; index++) {
      const element = array1[index];
      if (!userData[element]) {
        return res.status(400).json({
          message: element + CM.Lang_Messages("en", "feildmissing"),
        });
      }
    }

    const user = await Customer.findOne({
      code: userData.code,
      phone: userData.phone,
      isDeleted: false,
    });
    if (!user) {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "usernotfound"),
      });
    } else {
      let otpData = await Otp.find({
        userId: user._id,
        usedfor: "FORGOT-USER-PASSWORD",
      }).sort({
        createdAt: -1,
      });

      if (!otpData) {
        return res.status(400).json({
          message: CM.Lang_Messages("en", "otpexpired"),
        });
      }
      if (otpData[0].otp == userData.otp) {
        return res.status(200).json({
          message: CM.Lang_Messages("en", "otpverified"),
        });
      } else {
        return res.status(400).json({
          message: CM.Lang_Messages("en", "wrongotp"),
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

/**
 * @function  API_User_Reset_password
 * @description API Will be /api/v1/c/resetPassword
 * @example API_User_Reset_password
 */

router.post("/resetPassword", async (req, res) => {
  try {
    let userData = req.body;

    let array1 = ["email", "otp", "password", "confirmPassword"];
    for (let index = 0; index < array1.length; index++) {
      const element = array1[index];
      if (!userData[element]) {
        return res.status(400).json({
          message: element + CM.Lang_Messages("en", "feildmissing"),
        });
      }
    }

    if (userData.password != userData.confirmPassword) {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "newpassannconpass"),
      });
    }

    const user = await Customer.findOne({
      email: userData.email,
      isDeleted: false,
    });
    if (!user) {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "usernotfound"),
      });
    } else {
      let otp = await Otp.findOne({
        otp: userData.otp,
        userId: user._id,
      });
      if (!otp) {
        return res.status(400).json({
          message: CM.Lang_Messages("en", "otpexpired"),
        });
      } else {
        const currentPassHash = await Customer.findOne(
          { email: userData.email },
          "password"
        ).lean();
        let isPassSame = await bcrypt.compare(
          userData.password,
          currentPassHash.password
        );
        if (isPassSame) {
          return res.status(400).json({
            message: CM.Lang_Messages("en", "notSamePassword"),
          });
        }
        const salt = bcrypt.genSaltSync(10);
        let hash = await bcrypt.hash(userData.password, salt);
        user.password = hash;
        await user.save();

        return res.status(200).json({
          message: CM.Lang_Messages("en", "passwordreset"),
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

/**
 * @function  API_User_Reset_password
 * @description API Will be /api/v1/c/resetPassword/phone
 * @example API_User_Reset_password
 */

router.post("/resetPassword/phone", async (req, res) => {
  try {
    let userData = req.body;

    let array1 = ["code", "phone", "otp", "password", "confirmPassword"];
    for (let index = 0; index < array1.length; index++) {
      const element = array1[index];
      if (!userData[element]) {
        return res.status(400).json({
          message: element + CM.Lang_Messages("en", "feildmissing"),
        });
      }
    }

    if (userData.password != userData.confirmPassword) {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "newpassannconpass"),
      });
    }

    const user = await Customer.findOne({
      code: userData.code,
      phone: userData.phone,
      isDeleted: false,
    });
    if (!user) {
      return res.status(400).json({
        message: CM.Lang_Messages("en", "notFound"),
      });
    } else {
      let otp = await Otp.findOne({
        otp: userData.otp,
        userId: user._id,
      });
      if (!otp) {
        return res.status(400).json({
          message: CM.Lang_Messages("en", "otpexpired"),
        });
      } else {
        const currentPassHash = await Customer.findOne(
          { phone: userData.phone, code: userData.code },
          "password"
        ).lean();
        let isPassSame = await bcrypt.compare(
          userData.password,
          currentPassHash.password
        );
        if (isPassSame) {
          return res.status(400).json({
            message: CM.Lang_Messages("en", "notSamePassword"),
          });
        }
        const salt = bcrypt.genSaltSync(10);
        let hash = await bcrypt.hash(userData.password, salt);
        user.password = hash;
        await user.save();

        return res.status(200).json({
          message: CM.Lang_Messages("en", "passwordreset"),
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: CM.Lang_Messages("en", "servererr"),
    });
  }
});

module.exports = router;
