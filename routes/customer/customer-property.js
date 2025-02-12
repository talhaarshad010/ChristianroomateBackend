const express = require("express");
const router = express.Router();
const Property = require("../../models/property");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const Bookmark = require("../../models/bookmark");
const Image = require("../../models/images");
const moment = require("moment-timezone");
const FirstCap = require("../../common-modules/config");
const property = require("../../models/property");

/**
 * @function  add
 * @description API Will be /api/v1/c/property/add
 * @example add
 */

router.post("/add", async (req, res) => {
  let propertyData = req.body;
  let propertyScehma = Joi.object({
    rent: Joi.number()
      .required()
      .messages({ "*": `rent ${langFunction("en", "feildmissing")}` }),
    payable: Joi.string()
      .required()
      .messages({ "*": `payable ${langFunction("en", "feildmissing")}` }),
    title: Joi.string()
      .required()
      .messages({ "*": `title ${langFunction("en", "feildmissing")}` }),
    address: Joi.string()
      .required()
      .messages({ "*": `address ${langFunction("en", "feildmissing")}` }),
    location: Joi.object().keys({
      lat: Joi.number()
        .required()
        .messages({ "*": `lat ${langFunction("en", "feildmissing")}` }),
      lng: Joi.number()
        .required()
        .messages({ "*": `lng ${langFunction("en", "feildmissing")}` }),
    }),
    available_date: Joi.date()
      .required()
      .messages({
        "*": `available_date ${langFunction("en", "feildmissing")}`,
      }),
    lease_term: Joi.string().allow("", null),
    house_type: Joi.string().allow("", null),
    space_type: Joi.string().allow("", null),
    furnishing: Joi.string().allow("", null),
    range: Joi.string().allow("", null),
    gender: Joi.string().allow("", null),
    occupation: Joi.string().allow("", null),
    pets: Joi.string().allow("", null),
    smoker: Joi.string().allow("", null),
    guest_range: Joi.string()
      .required()
      .messages({ "*": `guest_range ${langFunction("en", "feildmissing")}` }),
    guest_gender: Joi.string()
      .required()
      .messages({ "*": `guest_gender ${langFunction("en", "feildmissing")}` }),
    guest_occupation: Joi.string()
      .required()
      .messages({
        "*": `guest_occupation ${langFunction("en", "feildmissing")}`,
      }),
    // guest_pets: Joi.string().required().messages({"*": `guest_pets ${langFunction("en", "feildmissing")}`,}),
    guest_pets: Joi.string().allow("", null),
    guest_smoker: Joi.string()
      .required()
      .messages({ "*": `guest_smoker ${langFunction("en", "feildmissing")}` }),
    description: Joi.string().allow("", null),
    service_wanted: Joi.string().allow("", null),
    help_offered: Joi.string().allow("", null),
    life_stage: Joi.string().allow("", null),
    relation_status: Joi.string().allow("", null),
    status: Joi.boolean()
      .required()
      .messages({ "*": `status ${langFunction("en", "feildmissing")}` }),
    images: Joi.array().allow("", null),
    amenties: Joi.array().allow("", null),
  });

  const { error } = propertyScehma.validate(propertyData);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      error,
    });
  }

  try {
    const property = Property({
      user: req.doc.id,
      images: propertyData.images,
      rent: propertyData.rent,
      payable: propertyData.payable,
      title: propertyData.title,
      location: {
        type: "Point",
        coordinates: [propertyData.location.lng, propertyData.location.lat],
      },
      address: propertyData.address,
      available_date: propertyData.available_date,
      lease_term: propertyData.lease_term,
      house_type: propertyData.house_type,
      space_type: propertyData.space_type,
      furnishing: propertyData.furnishing,
      amenties: propertyData.amenties,
      range: propertyData.range,
      age_start_range: propertyData.range.split("-")[0],
      age_end_range: propertyData.range.split("-")[1],
      gender: FirstCap.capitalizeWord(propertyData.gender),
      occupation: propertyData.occupation,
      pets: propertyData.pets,
      smoker: propertyData.smoker,
      guest_range: propertyData.guest_range,
      guest_age_start_range: propertyData.guest_range.split("-")[0],
      guest_age_end_range: propertyData.guest_range.split("-")[1],
      guest_gender: FirstCap.capitalizeWord(propertyData.guest_gender),
      guest_occupation: propertyData.guest_occupation,
      guest_pets: propertyData.guest_pets,
      guest_smoker: propertyData.guest_smoker,
      description: propertyData.description,
      service_wanted: propertyData.service_wanted,
      help_offered: propertyData.help_offered,
      life_stage: propertyData.life_stage,
      relation_status: propertyData.relation_status,
      status: propertyData.status,
      deleted: false,
    });

    await property.save();
    return res.status(200).json({
      message: langFunction("en", "propertyAdd"),
      data: property,
    });
  } catch (error) {
    console.log("error in add property: ", error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getAll
 * @description API Will be /api/v1/c/property/getAll
 * @example getAll
 */

router.post("/getAll", async (req, res) => {
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
      ageRange: Joi.string().allow("", null),
      budget: Joi.string().allow("", null),
      availableDate: Joi.date().allow("", null),
      gender: Joi.array().allow("", null),
      pets: Joi.array().allow("", null),
      space_type: Joi.array().allow("", null),
      lease_term: Joi.array().allow("", null),
      furnishing: Joi.array().allow("", null),
      house_type: Joi.array().allow("", null),
      searchString: Joi.string().allow("", null),
      location: Joi.object({
        lat: Joi.number().allow("", null),
        lng: Joi.number().allow("", null),
      }).allow("", null),
    });
    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    if (!userData?.location?.lng && !userData?.location?.lat) {
      return res.status(200).json({
        result: [],
      });
    }
    let startIndex = (userData.page - 1) * userData.perPage;
    let perPage = parseInt(userData.perPage);

    const match = {};
    let currentDate = new Date(moment().startOf("day").format());
    // match.available_date = {$gte:currentDate};

    if (userData.ageRange && userData.ageRange != "") {
      match.guest_age_start_range = {
        $lte: userData.ageRange.split("-")[1],
      };
      match.guest_age_end_range = {
        $gte: userData.ageRange.split("-")[0],
      };
    }

    if (userData.availableDate) {
      match.available_date = {
        // $gte:currentDate,
        $lte: new Date(moment(userData.availableDate).endOf("day").format()),
      };
    }
    // else {
    //   match.available_date = {$gte:currentDate}
    // }
    //set filter by geo location 5miles start
    let globalValues = {
      serviceableArea: 8,
    };
    function getServiceAbleArea() {
      return globalValues.serviceableArea;
    }

    if (userData.location.lng && userData.location.lat) {
      match.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [userData.location.lng, userData.location.lat],
          },
          $minDistance: 0,
          $maxDistance: getServiceAbleArea() * 1000, // 5 miles = 8.05 kM
        },
      };
    }

    //end filter
    if (userData.budget && userData.budget != "") {
      match.rent = {
        $gte: userData.budget.split("-")[0],
        $lte: userData.budget.split("-")[1],
      };
    }
    if (userData.gender && userData.gender.length > 0) {
      for (let index = 0; index < userData.gender.length; index++) {
        userData.gender[index] = FirstCap.capitalizeWord(
          userData.gender[index]
        );
      }
      match.guest_gender = { $in: userData.gender };
    }
    if (userData.pets && userData.pets.length > 0) {
      match.guest_pets = { $in: userData.pets };
    }
    if (userData.space_type && userData.space_type.length > 0) {
      match.space_type = { $in: userData.space_type };
    }
    if (userData.lease_term && userData.lease_term.length > 0) {
      match.lease_term = { $in: userData.lease_term };
    }
    if (userData.furnishing && userData.furnishing.length > 0) {
      match.furnishing = { $in: userData.furnishing };
    }
    if (userData.house_type && userData.house_type.length > 0) {
      match.house_type = { $in: userData.house_type };
    }

    match.deleted = false;
    match.status = true;
    match.user = { $ne: req.doc.id };

    match["$and"] = [
      { $or: [{ userDeleted: false }, { userDeleted: { $exists: false } }] },
      {
        $or: [
          { moderationStatus: true },
          { moderationStatus: { $exists: false } },
        ],
      },
      { $or: [{ visibility: true }, { visibility: { $exists: false } }] },
    ];

    if (userData.searchString) {
      match["$and"] = [
        ...match["$and"],
        {
          $or: [
            {
              pets: new RegExp(userData.searchString, "i"),
            },
            {
              house_type: new RegExp(userData.searchString, "i"),
            },
            {
              furnishing: new RegExp(userData.searchString, "i"),
            },
            {
              lease_term: new RegExp(userData.searchString, "i"),
            },
            {
              space_type: new RegExp(userData.searchString, "i"),
            },
            {
              address: new RegExp(userData.searchString, "i"),
            },
            {
              title: new RegExp(userData.searchString, "i"),
            },
          ],
        },
      ];
    }

    let propertyData = await Property.find({ ...match })
      .populate(["images", "amenties", "user"])
      .populate({ path: "user", populate: [{ path: "image" }] })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(perPage);

    if (!propertyData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    for (let i in propertyData) {
      let bookmark = await Bookmark.findOne({
        user: req.doc.id,
        property: propertyData[i]._id,
        type: 0,
      });
      if (bookmark) {
        propertyData[i].isbookMark = true;
        propertyData[i].bookmarkId = bookmark._id;
      }
    }

    let totalCountData = await Property.find(match);
    let totalCount = totalCountData.length;

    return res.status(200).json({
      result: propertyData,
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
@function getAll
@description API Will be /api/v1/c/property/getAllProperties
@example getAll */

router.get("/getAllProperties", async (req, res) => {
  try {
    // Replace the following line with your actual data retrieval logic
    const Property = await property.find(); // Assuming `property` is defined and connected to your database
    console.log("Length", Property.length);
    if (Property) {
      res.send({
        data: Property,
      });
    } else {
      res.status(404).send({
        message: "No properties found",
      });
    }
  } catch (error) {
    console.log("Error", error.message);
    res.status(500).send({
      error: error.message,
    });
  }
});

/**
 * @function  getByPropertyId
 * @description API Will be /api/v1/c/property/getByPropertyId
 * @example getByPropertyId
 */

router.post("/getByPropertyId", async (req, res) => {
  try {
    let propertyData = await Property.findOne({
      _id: req.body.propertyId,
    }).populate(["images", "amenties", "user"]);

    propertyData = await Image.populate(propertyData, { path: "user.image" });

    if (!propertyData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    let bookmark = await Bookmark.findOne({
      user: req.doc.id,
      property: propertyData._id,
      type: 0,
    });
    if (bookmark) {
      propertyData.isbookMark = true;
      propertyData.bookmarkId = bookmark._id;
    }
    return res.status(200).json({
      data: propertyData,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getPropertyByUserId
 * @description API Will be /api/v1/c/property/getPropertyByUserId
 * @example getPropertyByUserId
 */

router.post("/getPropertyByUserId", async (req, res) => {
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
      user: req.doc.id,
      deleted: false,
    };

    if (userData.searchString) {
      con["$or"] = [
        {
          title: new RegExp(userData.searchString, "i"),
        },
        {
          address: new RegExp(userData.searchString, "i"),
        },
      ];
    }

    let propertyData = await Property.find(con, {}, skipCondition).populate([
      "images",
      "amenties",
      "user",
    ]);

    propertyData = await Image.populate(propertyData, { path: "user.image" });

    if (!propertyData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    let totalCount = await Property.countDocuments(con);
    return res.status(200).json({
      result: propertyData,
      totalCount,
      message: langFunction("en", "success"),
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  update
 * @description API Will be /api/v1/c/property/update
 * @example update
 */

router.post("/update", async (req, res) => {
  let propertyData = req.body;
  let propertyScehma = Joi.object({
    propertyId: Joi.string()
      .required()
      .messages({ "*": `propertyId ${langFunction("en", "fieldmissing")}` }),
    rent: Joi.number()
      .required()
      .messages({ "*": `rent ${langFunction("en", "fieldmissing")}` }),
    payable: Joi.string()
      .required()
      .messages({ "*": `payable ${langFunction("en", "fieldmissing")}` }),
    title: Joi.string()
      .required()
      .messages({ "*": `title ${langFunction("en", "fieldmissing")}` }),
    address: Joi.string()
      .required()
      .messages({ "*": `address ${langFunction("en", "feildmissing")}` }),
    location: Joi.object().keys({
      lat: Joi.number()
        .required()
        .messages({ "*": `lat ${langFunction("en", "feildmissing")}` }),
      lng: Joi.number()
        .required()
        .messages({ "*": `lng ${langFunction("en", "feildmissing")}` }),
    }),
    available_date: Joi.string()
      .required()
      .messages({
        "*": `available_date ${langFunction("en", "fieldmissing")}`,
      }),
    lease_term: Joi.string().allow("", null),
    house_type: Joi.string().allow("", null),
    space_type: Joi.string().allow("", null),
    furnishing: Joi.string().allow("", null),
    range: Joi.string().allow("", null),
    gender: Joi.string().allow("", null),
    occupation: Joi.string().allow("", null),
    pets: Joi.string().allow("", null),
    smoker: Joi.string().allow("", null),
    guest_range: Joi.string()
      .required()
      .messages({ "*": `guest_range ${langFunction("en", "fieldmissing")}` }),
    guest_gender: Joi.string()
      .required()
      .messages({ "*": `guest_gender ${langFunction("en", "fieldmissing")}` }),
    guest_occupation: Joi.string()
      .required()
      .messages({
        "*": `guest_occupation ${langFunction("en", "fieldmissing")}`,
      }),
    guest_pets: Joi.string().allow("", null),
    // guest_pets: Joi.string().required().messages({"*": `guest_pets ${langFunction("en", "fieldmissing")}`,}),
    guest_smoker: Joi.string()
      .required()
      .messages({ "*": `guest_smoker ${langFunction("en", "fieldmissing")}` }),
    description: Joi.string().allow("", null),
    service_wanted: Joi.string().allow("", null),
    help_offered: Joi.string().allow("", null),
    life_stage: Joi.string().allow("", null),
    relation_status: Joi.string().allow("", null),
    status: Joi.boolean()
      .required()
      .messages({ "*": `status ${langFunction("en", "fieldmissing")}` }),
    images: Joi.array().allow("", null),
    amenties: Joi.array().allow("", null),
  });

  const { error } = propertyScehma.validate(propertyData);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      error,
    });
  }

  propertyData.location = {
    type: "Point",
    coordinates: [propertyData.location.lng, propertyData.location.lat],
  };

  try {
    propertyData.age_start_range = propertyData.range.split("-")[0];
    propertyData.age_end_range = propertyData.range.split("-")[1];
    propertyData.guest_age_start_range = propertyData.guest_range.split("-")[0];
    propertyData.guest_age_end_range = propertyData.guest_range.split("-")[1];
    let data = await Property.updateOne(
      { _id: req.body.propertyId },
      { ...propertyData },
      { upsert: true }
    );

    return res.status(200).json({
      message: langFunction("en", "dataupdated"),
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
 * @description API Will be /api/v1/c/property/delete
 * @example delete
 */

router.post("/delete", async (req, res) => {
  try {
    const test = await Property.findOne({
      _id: req.body.propertyId,
    });
    if (!test) {
      return res.status(400).json({
        message: "Property not found",
      });
    }
    let data = await Property.updateOne(
      { _id: req.body.propertyId },
      {
        $set: {
          deleted: true,
        },
      }
    );
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
 * @description API Will be /api/v1/c/property/status
 * @example status
 */

router.post("/status", async (req, res) => {
  try {
    const test = await Property.findOne({
      _id: req.body.propertyId,
    });
    if (!test) {
      return res.status(400).json({
        message: "Property not found",
      });
    }
    let data = await Property.updateOne(
      { _id: req.body.propertyId },
      {
        $set: {
          status: req.body.status,
        },
      }
    );
    return res.status(200).json({
      message: req.body.status
        ? `${test.title} activated`
        : `${test.title} deactivated`,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

module.exports = router;
