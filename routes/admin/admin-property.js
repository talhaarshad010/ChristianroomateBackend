const express = require("express");
const router = express.Router();
const Property = require("../../models/property");
const CM = require("../../common-modules/index");
const csv=CM.Csv;
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const path = require("path");
const findRemoveSync = require("find-remove");
const Ameninties = require("../../models/amenities")
const Email = require("../../common-modules/email")
const SMS = require("../../common-modules/sms")
const Customer = require("../../models/customer")


/**
 * @function  getAll
 * @description API Will be /api/v1/a/property/getAll
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
            status:  Joi.string().allow("", null),
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
                    'title': new RegExp(userData.searchString, 'i')
                },
                {
                    'location': new RegExp(userData.searchString, 'i')
                }
            ]
        }

    if(userData.status === "ACTIVE") {
      con.deleted = false;
    } else if(userData.status === "DELETED") {
      con.deleted = true;
    }

    let propertyData = await Property.find(
      con,{},skipCondition
    ).populate("amenties images").populate({path: "user", populate: [{path: "image"}]});


    if (!propertyData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    let totalCount = await Property.countDocuments(con);
        return res.status(200).json({
            "result": propertyData,
            totalCount,
            "message": langFunction('en', 'success'),
        });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getByPropertyId
 * @description API Will be /api/v1/a/property/getByPropertyId
 * @example getByPropertyId
 */

 router.post("/getByPropertyId", async (req, res) => {
  try {
    const propertyData = await Property.find({
      _id:req.body.propertyId,
    }).populate("amenties images").populate({path: "user", populate: [{path: "image"}]});
    if (!propertyData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    return res.status(200).json({
      data: propertyData,
    });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getPropertyByUserId
 * @description API Will be /api/v1/a/property/getPropertyByUserId
 * @example getPropertyByUserId
 */

 router.post("/getPropertyByUserId", async (req, res) => {
  try {
    let userData = req.body;

    let validator = Joi.object({
      page: Joi.number().required().messages({
          '*': `page ${langFunction("en", "feildmissing")}`
      }),
      perPage: Joi.number().required().messages({
          '*': `perPage ${langFunction("en", "feildmissing")}`
      }),
      userId: Joi.string().required().messages({
        '*': `userId ${langFunction("en", "feildmissing")}`
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
          user:req.body.userId,
          deleted:false,
        }

        if (userData.searchString) {

            con['$or'] = [

                {
                    'title': new RegExp(userData.searchString, 'i')
                },
                {
                    'location': new RegExp(userData.searchString, 'i')
                }
            ]
        }

    let propertyData = await Property.find(
      con,{},skipCondition
    ).populate("amenties images").populate({path: "user", populate: [{path: "image"}]});

    if (!propertyData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    let totalCount = await Property.countDocuments(con);
        return res.status(200).json({
            "result": propertyData,
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
 * @function  getHotProperties
 * @description API Will be /api/v1/a/property/getHotProperties
 * @example getHotProperties
 */

 router.get("/getHotProperties", async (req, res) => {
  try {

        skipCondition = {
            limit: 6,
        };
        let con = {
          deleted:false,
          status:true
        }
    let propertyData = await Property.find(
      con,{},skipCondition
    ).populate("amenties images").populate({path: "user", populate: [{path: "image"}]});

    if (!propertyData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
        return res.status(200).json({
            "result": propertyData,
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
 * @description API Will be /api/v1/a/property/update
 * @example update
 */

 router.post("/update", async (req, res) => {

  let propertyData = req.body;
  let propertyScehma = Joi.object({
    propertyId: Joi.string()
      .required()
      .messages({
        "*": `propertyId ${langFunction("en", "feildmissing")}`,
      }),
    rent: Joi.number()
      .required()
      .messages({
        "*": `rent ${langFunction("en", "feildmissing")}`,
      }),
      payable: Joi.string()
      .required()
      .messages({
        "*": `payable ${langFunction("en", "feildmissing")}`,
      }),
      title: Joi.string()
      .required()
      .messages({
        "*": `title ${langFunction("en", "feildmissing")}`,
      }),
      location: Joi.string()
      .required()
      .messages({
        "*": `location ${langFunction("en", "feildmissing")}`,
      }),
      available_date: Joi.string()
      .required()
      .messages({
        "*": `available_date ${langFunction("en", "feildmissing")}`,
      }),
      lease_term: Joi.string()
      .required()
      .messages({
        "*": `lease_term ${langFunction("en", "feildmissing")}`,
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
      furnishing: Joi.string()
      .required()
      .messages({
        "*": `rent ${langFunction("en", "feildmissing")}`,
      }),
      range: Joi.string()
      .required()
      .messages({
        "*": `range ${langFunction("en", "feildmissing")}`,
      }),
      gender: Joi.string()
      .required()
      .messages({
        "*": `gender ${langFunction("en", "feildmissing")}`,
      }),
      occupation: Joi.string()
      .required()
      .messages({
        "*": `occupation ${langFunction("en", "feildmissing")}`,
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
      guest_range: Joi.string()
      .required()
      .messages({
        "*": `guest_range ${langFunction("en", "feildmissing")}`,
      }),
      guest_gender: Joi.string()
      .required()
      .messages({
        "*": `smoker ${langFunction("en", "feildmissing")}`,
      }),
      guest_occupation: Joi.string()
      .required()
      .messages({
        "*": `guest_occupation ${langFunction("en", "feildmissing")}`,
      }),
      guest_pets: Joi.string()
      .required()
      .messages({
        "*": `guest_pets ${langFunction("en", "feildmissing")}`,
      }),
      guest_smoker: Joi.string()
      .required()
      .messages({
        "*": `guest_smoker ${langFunction("en", "feildmissing")}`,
      }),
      description: Joi.string()
      .required()
      .messages({
        "*": `description ${langFunction("en", "feildmissing")}`,
      }),
      service_wanted: Joi.string()
      .required()
      .messages({
        "*": `service_wanted ${langFunction("en", "feildmissing")}`,
      }),
      help_offered: Joi.string()
      .required()
      .messages({
        "*": `help_offered ${langFunction("en", "feildmissing")}`,
      }),
      life_stage: Joi.string()
      .required()
      .messages({
        "*": `life_stage ${langFunction("en", "feildmissing")}`,
      }),
      relation_status: Joi.string()
      .required()
      .messages({
        "*": `relation_status ${langFunction("en", "feildmissing")}`,
      }),
      images:Joi.array(),
      amenties:Joi.array(),


  });

  const {
    error
  } = propertyScehma.validate(propertyData);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      error,
    });
  }

  try {
    let data = await Property.updateOne(
      { _id: req.body.propertyId },
      {   ...propertyData},
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
 * @description API Will be /api/v1/a/property/delete
 * @example delete
 */

 router.post("/delete", async (req, res) => {
  try {

    const test = await Property.findOne({
          _id: req.body.propertyId,
          });
          if(!test){
            return res.status(400).json({
              message: "Property not found",
              });
          }
          let data = await Property.deleteOne(
                  { _id: req.body.propertyId});
    return res.status(200).json({  
      message: langFunction("en", "propertdelete"),
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
 * @description API Will be /api/v1/a/property/status
 * @example status
 */
router.post("/status", async (req, res) => {
  try {

    const test = await Property.findOne({
          _id: req.body.propertyId,
          });
          if(!test){
            return res.status(400).json({
              message: "Property not found",
              });
          }

    const user = await Customer.findOne({_id: test.user}).lean();


    let data = await Property.findOneAndUpdate(
      {_id: req.body.propertyId},
      {
        $set: {
          moderationStatus: req.body.moderationStatus,
        },
      }, {new: true}
    );
    if(req.body.moderationStatus == true) {
        if(user.email)
          await Email.property_approval(user._id, test.title);
        if(user.phone)
          await SMS.sendSms(user.code+''+user.phone,`Dear ${user.name}, Your Property ${test.title} has been approved by admin and now visible to other users.`)
      return res.status(200).json({
        message: `${data.title} has been approved successfully`,
        data: data,
      });
    } else {
      return res.status(200).json({
        message: `${data.title} has been blocked successfully`,
        data: data,
      })
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
 * @description API Will be  /api/v1/a/property/export
 * @example exportCSV
 */
router.get("/export", async(req,res) => {
  try {
    let doc = await Property.aggregate([
      {$match: {userDeleted: false}},
      {
        $lookup: {from: "customers", localField: "user", foreignField: "_id", as: "fulluser"}
      },
      {
        $unwind: {path: "$fulluser", "preserveNullAndEmptyArrays": true}
      },
      {
        $project: {
          "_id": 0,
          "Title": "$title",
          "Username": "$fulluser.username",
          "Status": "$status",
          "Rent": "$rent",
          "Payable": "$payable",
          "Location": "$location",
          "Available Date": "$available_date",
          "House Type": "$house_type",
          "Space Type": "$space_type",
          "Lease Terms": "$lease_term",
          "Furnishing": "$furnishing",
          "Gender": "$gender",
          "Pets": "$pets",
          "Smoker": "$smoker",
          "Amenties": "$amenties",
          "Age Range": "$range",
          "Occupation": "$occupation",
          "Guest Age Range": "$guest_range",
          "Guest Gender": "$guest_gender",
          "Guest Occupation": "$guest_occupation",
          "Guest Pets": "$guest_pets",
          "Guest Smoker": "$guest_smoker",
          "Description": "$description",
          "Service Wanted": "$service_wanted",
          "Help Offered": "$help_offered",
          "Life Stage": "$life_stage",
          "Relation Status": "$relation_status",
          "Listed On": "$createdAt"
        }
      }
      ])

    // populate the array of objectId of Amenities
    doc = await Ameninties.populate(doc, {path: "Amenties", select: "-_id name"});

    // get only Amenities name into array
    for(let d of doc) {
      if(d.Amenties) {
        let test = [];
        for(let a of d.Amenties) {
          test.push(a.name)
        }
        d["Amenities"] = test
      }
      delete d.Amenties
    }

    const sortOrder = ["SNo", "Title", "Username", "Status", "Rent", "Payable", "Location", "Available Date", "House Type", "Space Type", "Lease Terms", "Furnishing", "Help Offered", "Pets", "Smoker", "Gender", "Amenities", "Age Range", "Occupation", "Guest Age Range", "Guest Gender", "Guest Occupation", "Guest Pets", "Guest Smoker", "Description", "Service Wanted", "Help Offered", "Life Stage", "Relation Status", "Listed On"]

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
 * @function  getUnverifiedProperties
 * @description API Will be  /api/v1/a/property/unverifiedProperties
 * @example unverifiedProperties
 */
router.get("/getUnverifiedProperties", async(req,res) => {
  try {
    const properties = await Property.find({moderationStatus: false});
    return res.status(200).json({message: langFunction("en", "success"), data: properties});
  }
  catch (e) {
    console.error(e);
    return res.status(400).json({message: langFunction("en", "servererr")});
  }
})

module.exports = router;
