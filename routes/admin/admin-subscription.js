const express = require("express");
const router = express.Router();
const CMS = require("../../common-modules/index");
const langFunction = CMS.Lang_Messages;
const Subscription = require("../../models/subscriptionPlan");
const Joi = require("joi");
const SubsHistory = require("../../models/subsHistory");
const csv=CMS.Csv;
const findRemoveSync = require("find-remove");
const path = require("path");

/**
 * @function  Subscription_Insert
 * @description API Will be /api/v1/a/subscription/add
 * @example Subscription_Insert
 */

router.post("/add", async (req, res) => {
  try {
    let userData = req.body;
    let validator = Joi.object({
      title: Joi.string()
        .required()
        .messages({
          "*": `title ${langFunction("en", "feildmissing")}`,
        }),
      days: Joi.number()
        .required()
        .messages({
          "*": `days ${langFunction("en", "feildmissing")}`,
        }),
      price: Joi.number()
        .required()
        .messages({
          "*": `price ${langFunction("en", "feildmissing")}`,
        }),
      planType: Joi.string()
        .required()
        .messages({
          "*": `planType ${langFunction("en", "feildmissing")}`,
        }),
      priceAfterDiscount: Joi.number().allow('', null),
      discountType: Joi.string().allow('', null),
      discount: Joi.number().allow('', null),
      oneTimePlan: Joi.boolean(),
      status: Joi.string()
        .required()
        .messages({
          "*": `status ${langFunction("en", "feildmissing")}`,
        }),
    });

    const { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    let subsAvailable = await Subscription.findOne({oneTimePlan: userData.oneTimePlan, planType: userData.planType.toUpperCase()});
    if(subsAvailable) return res.status(400).json({message: langFunction("en", "subsExists")})

    let priceAfterDiscount;
    if (userData.discount > 0) {
      priceAfterDiscount =
        userData.discountType.toUpperCase() === "FLAT"
          ? userData.price - userData.discount || 0
          : userData.discountType.toUpperCase() === "PERCENTAGE"
          ? userData.price - (userData.price / 100) * userData.discount
          : userData.price;
    }

    let subs = new Subscription({
      ...userData,
      priceAfterDiscount: priceAfterDiscount || userData.price,
      discount: userData.discount || 0,
      planType: userData.planType.toUpperCase(),
      discountType: userData.discountType?.toUpperCase() || "",
      oneTimePlan: userData.oneTimePlan,
      status: userData.status.toUpperCase()
    });
    let doc = await subs.save();

    return res.status(200).json({
      message: langFunction("en", "newsubs"),
      data: doc,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  GetAll_Subscription
 * @description API Will be /api/v1/a/subscription/getAll
 * @example GetAll_Subscription
 */

router.get("/getAll", async (req, res) => {
  try {
    let subs = await Subscription.find({}).sort({createdAt: -1});
    if (subs)
      return res.status(200).json({
        message: langFunction("en", "success"),
        data: subs,
      });
    else
      return res.status(400).json({
        message: langFunction("en", "notFound"),
      });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});



/**
 * @function  export
 * @description API Will be /api/v1/a/subscription/export
 * @example exportCSV
 */

 router.get("/export", async (req, res) => {
  try {
    let subs = await Subscription.find({}, "-_id -oneTimePlan -createdAt -updatedAt -__v").lean();

    sortOrder = ["SNo","title","planType","days","status","price","discountType","discount","priceAfterDiscount"];

    subs = CMS.SortObj(subs, sortOrder);

    if(subs.length>0){
      const csvFileName=await csv(subs);
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

/**
 * @function  Update_Subscription
 * @description API Will be /api/v1/a/subscription/update
 * @example Update_Subscription
 */

router.post("/update", async (req, res) => {
  const userData = req.body;
  try {
    let validator = Joi.object({
      title: Joi.string()
        .required()
        .messages({
          "*": `title ${langFunction("en", "feildmissing")}`,
        }),
      days: Joi.number()
        .required()
        .messages({
          "*": `days ${langFunction("en", "feildmissing")}`,
        }),
      price: Joi.number()
        .required()
        .messages({
          "*": `price ${langFunction("en", "feildmissing")}`,
        }),
      planType: Joi.string()
        .required()
        .messages({
          "*": `planType ${langFunction("en", "feildmissing")}`,
        }),
      priceAfterDiscount: Joi.number().allow('', null),
      discountType: Joi.string().allow('', null),
      discount: Joi.number().allow('', null),
      oneTimePlan: Joi.boolean(),
      status: Joi.string()
        .required()
        .messages({
          "*": `status ${langFunction("en", "feildmissing")}`,
        }),
        id: Joi.string()
        .required()
        .messages({
          "*": `id ${langFunction("en", "feildmissing")}`,
        }),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    let priceAfterDiscount;
    if (userData.discount > 0) {
      priceAfterDiscount =
        userData.discountType.toUpperCase() === "FLAT"
          ? userData.price - userData.discount || 0
          : userData.discountType.toUpperCase() === "PERCENTAGE"
          ? userData.price - (userData.price / 100) * userData.discount
          : userData.price;
    }

    let subs = await Subscription.updateOne({ _id: userData.id }, {...userData, priceAfterDiscount: priceAfterDiscount || userData.price});
    if (subs)
      return res.status(200).json({
        message: langFunction("en", "subsUpdated"),
      });
    else
      return res.status(400).json({
        message: langFunction("en", "notFound"),
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
 * @description API Will be /api/v1/a/subscription/getBySubId
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
 * @function  block
 * @description API Will be /api/v1/a/subscription/block
 * @example block
 */

 router.post("/block", async (req, res) => {
  try {

          let data = await Subscription.updateMany(
                  { deleted: true},
                  {
                    $set: {
                      status: req.body.status.toUpperCase(),
                    },
                  }
                );
    return res.status(200).json({  
      message: langFunction("en", "success"),
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  delete
 * @description API Will be /api/v1/a/subscription/delete
 * @example delete
 */

 router.post("/delete", async (req, res) => {
  try {
    let data = await Subscription.deleteOne({_id:req.body.subId});
    return res.status(200).json({  
      message: langFunction("en", "success"),
      data: data,
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
 * @description API Will be /api/v1/a/subscription/getSubByUserId
 * @example getSubByUserId
 */
 router.post("/getSubByUserId", async (req, res) => {

  try {
    const subs = await SubsHistory.find({ userId:req.body.userId }).populate(["userId","plan"]);
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
 * @function disableAllSubs
 * @description API Will be /api/v1/a/subscription/disableAll
 */
 router.get("/disableAll", async (req, res) => {

  try {
    await Subscription.updateMany({}, {status: "INACTIVE"});
    return res.status(200).json({
      message: langFunction("en", "allSubsDisabled"),
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function enableAll
 * @description API Will be /api/v1/a/subscription/enableAll
 */
 router.get("/enableAll", async (req, res) => {

  try {
    await Subscription.updateMany({}, {status: "ACTIVE"});
    return res.status(200).json({
      message: langFunction("en", "allSubsEnabled"),
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});


module.exports = router;
