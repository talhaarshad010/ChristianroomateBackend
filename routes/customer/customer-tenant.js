const express = require("express");
const router = express.Router();
const Tenant = require("../../models/tenant");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const Bookmark = require("../../models/bookmark");
const Customer = require("../../models/customer");
const moment = require("moment-timezone");
const FirstCap = require("../../common-modules/config");

/**
 * @function  add
 * @description API Will be /api/v1/c/tenant/add
 * @example add
 */

router.post("/add", async (req, res) => {

  let tenantData = req.body;
  let tenantScehma = Joi.object({

      budget: Joi.number().required().messages({"*": `budget ${langFunction("en", "feildmissing")}`,}),
      available_date: Joi.date().required().messages({"*": `available_date ${langFunction("en", "feildmissing")}`,}),
      household_occupants: Joi.string().allow('', null),
      house_type: Joi.string().allow('', null),
      space_type: Joi.string().allow('', null),
      lease_term: Joi.string().allow('', null),
      furnishing: Joi.string().allow('', null),
      help_offered: Joi.string().allow('', null),
      gender: Joi.string().allow("", null),
      pets: Joi.string().allow("", null),
      smoker: Joi.string().allow("", null),
      address: Joi.string().required().messages({"*": `address ${langFunction("en", "feildmissing")}`,}),
      location: Joi.object().keys({
        lat: Joi.number().required().messages({"*": `lat ${langFunction("en", "feildmissing")}`,}),
        lng: Joi.number().required().messages({"*": `lng ${langFunction("en", "feildmissing")}`,}),
      }),
      status: Joi.boolean().required().messages({"*": `status ${langFunction("en", "feildmissing")}`,}),
      age: Joi.number().allow("", null),
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

  const {username} = await Customer.findOne({_id: req.doc.id}, "username");
  
  try {

    const tenant = Tenant({
      user: req.doc.id,
      username,
      budget: tenantData.budget,
      location: {type:"Point", coordinates:[tenantData.location.lng, tenantData.location.lat ]},
      address: tenantData.address,
      available_date:tenantData.available_date,
      household_occupants: tenantData.household_occupants,
      house_type: tenantData.house_type,
      space_type:tenantData.space_type,
      lease_term: tenantData.lease_term,
      gender:  FirstCap.capitalizeWord(tenantData.gender),
      furnishing:tenantData.furnishing,
      smoker: tenantData.smoker,
      help_offered: tenantData.help_offered,
      pets: tenantData.pets,
      status: tenantData.status,
      age:tenantData.age,
    });
    
    let doc = await tenant.save();
    return res.status(200).json({

      message: langFunction('en', 'success'),
      data: doc,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getAll
 * @description API Will be /api/v1/c/tenant/getAll
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
            ageRange:Joi.string().allow('',null),
            availableDate: Joi.date().allow('', null),
            budget: Joi.string().allow('', null),
            gender: Joi.array().allow('', null),
            smoker: Joi.array().allow('', null),
            pets: Joi.array().allow('', null),
            household_occupants: Joi.array().allow('', null),
            house_type: Joi.array().allow('', null),
            searchString: Joi.string().allow('', null),
            location:Joi.object({
              lat: Joi.number().allow('', null),
              lng: Joi.number().allow('', null),
            }).allow('', null)
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
      if( !userData?.location?.lng && !userData?.location?.lat ){
        return res.status(200).json({
          "result": []
      });
      }
      let startIndex = ((userData.page - 1) * userData.perPage);
      let perPage = parseInt(userData.perPage);

      const match = {};

  if(userData.ageRange && userData.ageRange != ""){

    match.age = {
      $lte:userData.ageRange.split("-")[1],
      $gte: userData.ageRange.split("-")[0]
  }
  }
  if(userData.budget && userData.budget != ""){
    match.budget = {$gte:userData.budget.split("-")[0],
    $lte:userData.budget.split("-")[1]}
  }

  let currentDate = new Date(moment().startOf("day").format());
  if(userData.availableDate){
      match.available_date = {
        // $gte:currentDate,
      $lte: new Date(moment(userData.availableDate).endOf("day").format())}
  } 
  // else {
  //     match.available_date = {$gte:currentDate};
  // }
   //set filter by geo location 5miles start
   let globalValues = {
    serviceableArea: 8
}
function getServiceAbleArea(){
    return globalValues.serviceableArea
}

if (userData.location.lng, userData.location.lat) {
    match.location = {
        $near: {
            $geometry: {
                type: 'Point',
                coordinates: [userData.location.lng, userData.location.lat]
            },
            $minDistance: 0,
            $maxDistance: getServiceAbleArea()*1000, // 5 miles = 8.05 kM
        }
    }
}
//end filter
  
  if(userData.gender && userData.gender.length > 0){

      for (let index = 0; index < userData.gender.length; index++) {
        userData.gender[index]=  FirstCap.capitalizeWord(userData.gender[index]);
      }
      match.gender={$in:userData.gender};
  }
  if(userData.smoker && userData.smoker.length > 0){
    match.smoker={$in:userData.smoker};
  }
  if(userData.pets && userData.pets.length > 0){
    match.pets={$in:userData.pets};
  }
  if(userData.household_occupants && userData.household_occupants.length > 0){
    match.household_occupants={$in:userData.household_occupants};
  }
  if(userData.house_type && userData.house_type.length > 0){
    match.house_type={$in:userData.house_type};
  }
  match.deleted=false;
  match.status=true;
  match.user= {$ne:req.doc.id};
  
  match["$and"] = [
    {"$or": [{userDeleted: false}, {userDeleted: {$exists: false}}]},
    {"$or": [{moderationStatus: true}, {moderationStatus: {$exists: false}}]},
    {"$or": [{visibility: true}, {visibility: {$exists: false}}]}
  ];
 
  if (userData.searchString) {
    if (userData.searchString) {
      match["$and"] = [
        ...match["$and"],
        {
          "$or": [
            {
              pets: new RegExp(userData.searchString, "i"),
            },
            {
              household_occupants: new RegExp(userData.searchString, "i"),
            },
            {
              house_type: new RegExp(userData.searchString, "i"),
            },
            {
              username: new RegExp(userData.searchString, "i"),
            },
            {
              address: new RegExp(userData.searchString, "i"),
            }]
        }
      ];
    }
  }
  let tntData = await Tenant.find({...match}).populate([{path: 'user', populate: {path: 'image',}}])
  .sort({createdAt:-1}).skip(startIndex).limit(perPage);

  if (!tntData) {
    return res.status(400).json({
      message: langFunction("en", "propertyfound"),
    });
  }
  for(let i in tntData){
    let bookmark =  await Bookmark.findOne({
      user: req.doc.id,
      tenant: tntData[i]._id,
      type: 1,
    });
    if(bookmark){
      tntData[i].isbookMark=true;
      tntData[i].bookmarkId = bookmark._id;
    }
  }
  let totalCountData = await Tenant.find(match);
  let totalCount = totalCountData.length;
      return res.status(200).json({
          "result": tntData,
          totalCount,
          "message": langFunction('en', 'success'),
      });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getBytenantId
 * @description API Will be /api/v1/c/tenant/getBytenantId
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
      let bookmark =  await Bookmark.findOne({
        user: req.doc.id,
        tenant: tenantData._id,
        type: 1,
      });
      if(bookmark){
        tenantData.isbookMark=true;
        tenantData.bookmarkId=bookmark._id;
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
 * @description API Will be /api/v1/c/tenant/getTenantByUserId
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
          user:req.doc.id,
          deleted:false
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
 * @description API Will be /api/v1/c/tenant/update
 * @example update
 */

 router.post("/update", async (req, res) => {

  let tenantData = req.body;
  let tenantScehma = Joi.object({
    address: Joi.string().required().messages({"*": `address ${langFunction("en", "feildmissing")}`,}),
    location: Joi.object().keys({
      lat: Joi.number().required().messages({"*": `lat ${langFunction("en", "feildmissing")}`,}),
      lng: Joi.number().required().messages({"*": `lng ${langFunction("en", "feildmissing")}`,}),
    }),

    budget: Joi.number().required().messages({"*": `budget ${langFunction("en", "feildmissing")}`,}),
    available_date: Joi.date().required().messages({"*": `available_date ${langFunction("en", "feildmissing")}`,}),
    household_occupants: Joi.string().allow('', null),
    house_type: Joi.string().allow('', null),
    space_type: Joi.string().allow('', null),
    lease_term: Joi.string().allow('', null),
    furnishing: Joi.string().allow('', null),
    help_offered: Joi.string().allow("", null),
    gender: Joi.string().allow("", null),
    pets: Joi.string().allow("", null),
    smoker: Joi.string().allow("", null),
    tenId: Joi.string().required().messages({"*": `tenId ${langFunction("en", "feildmissing")}`,}),
    status: Joi.boolean().required().messages({"*": `status ${langFunction("en", "feildmissing")}`,}),
    age: Joi.number().allow("", null),
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
   tenantData.location = {
    type: "Point",
    coordinates: [tenantData.location.lng, tenantData.location.lat]
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
 * @description API Will be /api/v1/c/tenant/delete
 * @example delete
 */

 router.post("/delete", async (req, res) => {
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
 * @description API Will be /api/v1/c/tenant/status
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
                      status: req.body.status,
                    },
                  }
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





module.exports = router;
