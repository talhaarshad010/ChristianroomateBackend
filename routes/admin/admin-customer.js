const express = require("express");
const router = express.Router();
const langFunction = require("../../common-modules/lang-messages");
const Customer = require("../../models/customer");
const Joi = require('joi');
const CM=require("../../common-modules/index");
const csv=CM.Csv;
const findRemoveSync = require("find-remove");
const path = require("path");
const Email = require("../../common-modules/email");
const SMS = require("../../common-modules/sms");

/**
 * @function  Customer_Pagin
 * @description API Will be  /api/v1/a/customer/pagin
 */

 router.post("/pagin", async (req, res) => {
    try {
      let userData = req.body;

      let validator = Joi.object({
        page: Joi.number()
          .required()
          .messages({
            "*": `page ${langFunction("en", "feildmissing")}`,
          }),
        perPage: Joi.number()
          .required()
          .messages({
            "*": `perPage ${langFunction("en", "feildmissing")}`,
          }),
        searchString: Joi.string().allow("", null),
      });

      let { error } = validator.validate(userData);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          error,
        });
      }

      let startIndex = (userData.page - 1) * userData.perPage;
      let perPage = parseInt(userData.perPage);
      skipCondition = {
        skip: startIndex,
        limit: perPage,
        sort: { createdAt: -1 },
      };
      let con = {
         isDeleted:false
      };

      if (userData.searchString) {
        con["$or"] = [
          {
            name: new RegExp(userData.searchString, "i"),
          },
          {
            email: new RegExp(userData.searchString, "i"),
          },
          {
            phone: new RegExp(userData.searchString, "i"),
          },


        ];
      }

      let doc = await Customer.find(con, {}, skipCondition).populate(["image", "currentPlan"]);
      let totalCount = await Customer.countDocuments(con);
      return res.status(200).json({
        result: doc,
        totalCount,
        message: langFunction("en", "success"),
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: langFunction("en", "servererr"),
      });
    }
  });



/**
 * @function Get_Customer_By_ID
 * @description API Will be  /api/v1/a/customer/getCustomerById
 * @example Get_Customer_By_ID
 */

 router.get("/getCustomerById/:id", async (req, res) => {
  try {


    let data = await Customer.findOne({_id:req.params.id}).populate(["image","galleryImage", "country", "currentPlan"]);

    if (data) {
      return res.status(200).json({
        message: langFunction('en', 'success'),
        "data": data,
      });
    } else {
      return res.status(400).json({
        message: langFunction('en', 'notFound'),
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction('en', 'servererr'),
    });
  }
})


/**
 * @function  Update_Customer_Status
 * @description API Will be /api/v1/a/customer/updateStatus/:id
 * @example  Update_Customer_Status
 */
router.post('/updateStatus/:id', async (req, res) => {
  try {
      let userData = req.body;
      let validator = Joi.object({
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

      let user = await Customer.findOne({
          _id: req.params.id
      })
      if (!user) {
          return res.status(400).json({
              "message": langFunction('en', 'cusnotfound')
          });
      }

      let data = await Customer.updateOne({
          _id: req.params.id,
      }, {
          $set: {
              status : userData.status.toUpperCase()
          }
      })
    
    if (userData.status.toUpperCase() === "VERIFIED") {
      return res.status(200).json({
        message: langFunction('en', 'userVerified'),
        "data": data,
      });
    } else {
      return res.status(200).json({
        message: langFunction('en', 'userDisabledByAdmin'),
        "data": data,
      });
    }
    
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          message: langFunction('en', 'servererr'),
      });
  }
})




/**
 * @function  export
 * @description API Will be  /api/v1/a/customer/export
 * @example exportCSV
 */
router.get("/export", async (req, res) => {
  try {

    let doc = await Customer.aggregate([
      {$lookup: {from: "subscriptionplans", localField: "currentPlan", foreignField: "_id", as: "currentPlan"}},
      {$unwind: {path: "$currentPlan", "preserveNullAndEmptyArrays": true}},
      {$project: {_id: 0, currentPlan: "$currentPlan.title", Name: "$name", Username: "$username", Code: "$code", Phone: "$phone", "Is Verified": "$status", Email: "$email", "Registered On": {$dateToString: {format: "%m-%d-%Y %H:%M", date: "$createdAt"}}, "Plan Active": "$isPlanActive", "Status": "$enabled"}}
    ]);

    const sortOrder = ["SNo", "Name", "Username", "Is Verified", "Email", "Code", "Phone", "Plan Active", "Registered On", "Status"];

    doc = CM.SortObj(doc, sortOrder);

    for(let obj of doc){
      if(obj.Status === true)
        obj.Status = "ACTIVE"
      else if(obj.Status === false)
        obj.Status = "BLOCKED"
    }

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

/**
 * @function  update
 * @description API Will be  /api/v1/a/customer/update
 * @example update
 */
router.post("users/update", async (req, res) => {
  try {
    let userData = req.body;
    let validator = Joi.object({
      name: Joi.string()
        .required()
        .messages({
          "*": `firstName ${langFunction("en", "feildmissing")}`,
        }),
      username: Joi.string()
        .required()
        .messages({
          "*": `lastName ${langFunction("en", "feildmissing")}`,
        }),
      image: Joi.string(),
      galleryImage: Joi.array(),
      code: Joi.string(),
      phone: Joi.string(),
      email: Joi.string(),
      gender: Joi.string()
        .required()
        .messages({
          "*": `gender ${langFunction("en", "feildmissing")}`,
        }),
      age: Joi.number()
        .required()
        .messages({
          "*": `age ${langFunction("en", "feildmissing")}`,
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
      occupation: Joi.string(),
      smoker: Joi.boolean(),
      pet: Joi.string(),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    delete userData.code;
    delete userData.phone;
    delete userData.email;

    let data = await Customer.updateOne(
      { _id: userData._id },
      {   ...userData, gender: userData.gender.toUpperCase()},
      { upsert: true }
    );

    return res.status(200).json({
      message: langFunction("en", "dataupdated"),
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
 * @function  Admin_DisabledAndEnabled
 * @description API Will be /api/v1/a/customer/enabledordisabled/:id
 * @example Admin DisabledAndEnabled
 */

router.post('/enabledordisabled/:id', async (req, res) => {
  try {
    if (req.doc.role === 'ADMIN') {
      let userData = req.body;
      let user = await Customer.findOne({
        _id: req.params.id
      })
      if (user) {
        let data = await Customer.updateOne(
          { _id: req.params.id },
          {
            $set: {
              enabled: userData.enabled
            }
          })

        if(userData.enabled == false) {
          if(user.phone)
            await SMS.sendSms(user.code+''+user.phone,`Dear ${user.name}, your Christian Roommate user account is terminated by admin due to policy violations.`)
          if(user.email)
          await Email.send_user_disabled(user._id);
        }

        if (userData.enabled == true) {
          return res.status(200).json({
            message: langFunction('en', 'userEnabled'),
            "data": data,
          });
        } else {
          return res.status(200).json({
            message: langFunction('en', 'userDisabledByAdmin'),
            "data": data,
          });   
        }
      }
      return res.status(400).json({
        message: langFunction('en', 'customernotfound'),
      });
    }
    return res.status(400).json({
      message: langFunction('en', 'notAuthorized'),
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction('en', 'servererr'),
    });
  }
})

module.exports = router;
