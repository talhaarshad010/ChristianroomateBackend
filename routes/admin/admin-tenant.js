const express = require("express");
const router = express.Router();
const Tenant = require("../../models/tenant");
const config = require("../../common-modules/config");
const CM = require("../../common-modules/index");
const csv=CM.Csv;
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const tenant = require("../../models/tenant");
const Property = require("../../models/property");
const path = require("path");
const findRemoveSync = require("find-remove");



/**
 * @function  getAll
 * @description API Will be /api/v1/a/tenant/getAll
 * @example getAll
 */

router.post("/getAll", async (req, res) => {
  try {
    let userData = req.body;

        let validator = Joi.object({
            page: Joi.number().required().messages({
                '*': `page ${langFunction("en", "feildmissing")}`
            }),
            perPage: Joi.number().required().messages({
                '*': `perPage ${langFunction("en", "feildmissing")}`
            }),
            searchString: Joi.string().allow('', null),
            status: Joi.string().allow('', null)
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
          userDeleted: false,
        }

        if (userData.searchString) {

            con['$or'] = [
                {
                    'house_type': new RegExp(userData.searchString, 'i')
                },
                {
                    'space_type': new RegExp(userData.searchString, 'i')
                },
                {
                  'location': new RegExp(userData.searchString, 'i')
                },
                {
                  'username': new RegExp(userData.searchString, "i"),
                },
            ]
        }


        if(userData.status === "ACTIVE") {
          con.deleted = false;
        } else if(userData.status === "DELETED") {
          con.deleted = true;
        }

        let tenantData = await Tenant.find(
          con,{},skipCondition
        ).populate(["user",{
          path: 'user',
          populate:{
            path:'image'
          }
        }]);



    if (!tenantData) {
      return res.status(400).json({
        message: langFunction("en", "error"),
      });
    }
    let totalCount = await Tenant.countDocuments(con);
        return res.status(200).json({
            "result": tenantData,
            totalCount,
            "message": langFunction('en', 'success'),
        });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getBytenantId
 * @description API Will be /api/v1/a/tenant/getBytenantId
 * @example getBytenantId
 */

 router.post("/getBytenantId", async (req, res) => {
  try {
    const tenantData = await Tenant.findOne({
      _id:req.body.tenId,
    }).populate(["user",{
      path: 'user',
      populate:{
        path:'image',
      }
    },{
      path: 'user',
      populate:{
        path:'galleryImage',
      }
    }]);
    if (!tenantData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    return res.status(200).json({
      data: tenantData,
    });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getTenantByUserId
 * @description API Will be /api/v1/a/tenant/getTenantByUserId
 * @example getTenantByUserId
 */

 router.post("/getTenantByUserId", async (req, res) => {
  try {
    let userData = req.body;

    let validator = Joi.object({
      page: Joi.number().required().messages({
          '*': `page ${langFunction("en", "feildmissing")}`
      }),
      perPage: Joi.number().required().messages({
          '*': `perPage ${langFunction("en", "feildmissing")}`
      }),
      user: Joi.string().required().messages({
        '*': `user ${langFunction("en", "feildmissing")}`
    }),
      searchString: Joi.string().allow('', null)
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
          user:req.body.user,
          deleted:false,
        }

        if (userData.searchString) {

            con['$or'] = [
            {
                'house_type': new RegExp(userData.searchString, 'i')
            },
            {
                'space_type': new RegExp(userData.searchString, 'i')
            }
            ]
        }

    let tenantData = await Tenant.find(
      con,{},skipCondition
    ).populate(["user",{
      path: 'user',
      populate:{
        path:'image'
      }
    }]);

    if (!tenantData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    let totalCount = await Tenant.countDocuments(con);
        return res.status(200).json({
            "result": tenantData,
            totalCount,
            "message": langFunction('en', 'success'),
        });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});


/**
 * @function  update
 * @description API Will be /api/v1/a/tenant/update
 * @example update
 */

 router.post("/update", async (req,res) => {

  let tenantData = req.body;
  let tenantScehma = Joi.object({
    location:{
      lat: Joi.string()
    .required()
    .messages({
      "*": `lat ${langFunction("en", "feildmissing")}`,
    }),
    long: Joi.string()
    .required()
    .messages({
      "*": `long ${langFunction("en", "feildmissing")}`,
    }),
    },
      budget: Joi.number()
      .required()
      .messages({
        "*": `budget ${langFunction("en", "feildmissing")}`,
      }),
      available_date: Joi.date()
      .required()
      .messages({
        "*": `available_date ${langFunction("en", "feildmissing")}`,
      }),
      household_occupants: Joi.string()
      .required()
      .messages({
        "*": `household_occupants ${langFunction("en", "feildmissing")}`,
      }),
      house_type: Joi.string()
      .required()
      .messages({
        "*": `house_type ${langFunction("en", "feildmissing")}`,
      }),
      space_type: Joi.string()
      .required()
      .messages({
        "*": `space_type ${langFunction("en", "feildmissing")}`,
      }),
      lease_term: Joi.string()
      .required()
      .messages({
        "*": `lease_term ${langFunction("en", "feildmissing")}`,
      }),
      furnishing: Joi.string()
      .required()
      .messages({
        "*": `furnishing ${langFunction("en", "feildmissing")}`,
      }),
      help_offered: Joi.string()
      .required()
      .messages({
        "*": `help_offered ${langFunction("en", "feildmissing")}`,
      }),
      gender: Joi.string()
      .required()
      .messages({
        "*": `gender ${langFunction("en", "feildmissing")}`,
      }),
      pets: Joi.string()
      .required()
      .messages({
        "*": `pets ${langFunction("en", "feildmissing")}`,
      }),
      smoker: Joi.string()
      .required()
      .messages({
        "*": `smoker ${langFunction("en", "feildmissing")}`,
      }),
      tenId: Joi.string()
      .required()
      .messages({
        "*": `tenId ${langFunction("en", "feildmissing")}`,
      }),

  });

  const {
    error
  } = tenantScehma.validate(tenantData);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      error,
    });
  }

  try {
    let data = await Tenant.updateOne(
      { _id: req.body.tenId },
      {   ...tenantData},
      { upsert: true }
    );

    return res.status(200).json({
      message: langFunction('en', 'dataupdated'),
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  delete
 * @description API Will be /api/v1/a/tenant/delete
 * @example delete
 */

 router.post("/delete", async (req,res) => {
  try {

    const test = await Tenant.findOne({
          _id: req.body.tenId,
          });
          if(!test){
            return res.status(400).json({
              message: "Tenant not found",
              });
          }
          let data = await Tenant.updateOne(
                  { _id: req.body.tenId},
                  {
                    $set: {
                      deleted: true,
                    },
                  }
                );
    return res.status(200).json({
      message: langFunction("en", "tenantdeleted"),
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
 * @function  status
 * @description API Will be /api/v1/a/tenant/status
 * @example status
 */

 router.post("/status", async (req, res) => {
  try {

    const test = await Tenant.findOne({
          _id: req.body.tenId,
          });
          if(!test){
            return res.status(400).json({
              message: "Tenant not found",
              });
          }
          let data = await Tenant.updateOne(
                  { _id: req.body.tenId},
                  {
                    $set: {
                      moderationStatus: req.body.moderationStatus,
                    },
                  }
                );
          if (req.body.moderationStatus === true) {
            return res.status(200).json({
              message: langFunction("en", "tenantApproved"),
              data: data,
            });        
          } else {
            return res.status(200).json({
              message: langFunction("en", "tenantBlocked"),
              data: data,
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
 * @function  export
 * @description API Will be  /api/v1/a/tenant/export
 * @example exportCSV
 */
router.get("/export", async(req,res) => {
  try {

    let doc = await Tenant.aggregate([
      {
        $lookup: {from: "customers", localField: "user", foreignField: "_id", as: "fulluser"}
      },
      {
        $unwind: {path: "$fulluser", "preserveNullAndEmptyArrays": true}
      },
      {
        $project: {
          "_id": 0,
          "Username": "$fulluser.username",
          "Location": "$location",
          "Budget": "$budget",
          "Age": "$age",
          "Available Date": "$available_date",
          "Household Occupants": "$household_occupants",
          "House Type": "$house_type",
          "Space Type": "$space_type",
          "Lease Terms": "$lease_term",
          "Furnishing": "$furnishing",
          "Help Offered": "help_offered",
          "Gender": "$gender",
          "Pets": "$pets",
          "Smoker": "$smoker",
          "Status": "$status",
          "Requested On": "$createdAt"
        }
      }])

    const sortOrder = ["SNo", "Username", "Age", "Gender", "Location", "Budget", "Available Date", "Household Occupants", "House Type", "Space Type", "Lease Terms", "Furnishing", "Help Offered", "Pets", "Smoker", "Status", "Requested On"]

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
  } catch (e) {
    console.error(e);
    res.status(400).json({message: langFunction("en", "servererr")})
  }
})

/**
 * @function  getUnverifiedTenants
 * @description API Will be  /api/v1/a/tenant/getUnverifiedTenants
 * @example getUnverifiedTenants
 */
router.get("/getUnverifiedTenants", async(req,res) => {
  try {
    const properties = await Tenant.find({moderationStatus: false});
    return res.status(200).json({message: langFunction("en", "success"), data: properties});
  }
  catch (e) {
    console.error(e);
    return res.status(400).json({message: langFunction("en", "servererr")});
  }
})


module.exports = router;
