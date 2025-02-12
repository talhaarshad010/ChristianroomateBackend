const express = require("express");
const router = express.Router();
const Property = require("../../models/requestedProperty");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const Bookmark = require("../../models/bookmark");

/**
 * @function  add
 * @description API Will be /api/v1/c/request-place/add
 * @example add
 */

router.post("/add", async (req, res) => {
  let userData = req.body;
  let propertyScehma = Joi.object({
    budget: Joi.number()
      .required()
      .messages({
        "*": `budget ${langFunction("en", "feildmissing")}`,
      }),
    location: Joi.string()
      .required()
      .messages({
        "*": `location ${langFunction("en", "feildmissing")}`,
      }),
    coordinates: {
      lat: Joi.string()
        .required()
        .messages({
          "*": `lat ${langFunction("en", "feildmissing")}`,
        }),
      lng: Joi.string()
        .required()
        .messages({
          "*": `lng ${langFunction("en", "feildmissing")}`,
        }),
    },
    available_date: Joi.date()
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
    occupants: Joi.string()
      .required()
      .messages({
        "*": `occupants${langFunction("en", "feildmissing")}`,
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
    help_offered: Joi.string()
      .required()
      .messages({
        "*": `help_offered ${langFunction("en", "feildmissing")}`,
      }),
    status: Joi.boolean()
      .required()
      .messages({
        "*": `status ${langFunction("en", "feildmissing")}`,
      }),
  });

  const { error } = propertyScehma.validate(userData);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      error,
    });
  }

  try {
    const property = new Property(userData);
    await property.save();
    return res.status(200).json({
      message: langFunction("en", "propertyAdd"),
      data: property,
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
 * @description API Will be /api/v1/c/request-place/getAll
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
      budget: Joi.string().allow("", null),
      availableDate: Joi.date().allow("", null),
      gender: Joi.array().allow("", null),
      space_type: Joi.array().allow("", null),
      lease_term: Joi.array().allow("", null),
      furnishing: Joi.array().allow("", null),
      house_type: Joi.array().allow("", null),
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

    const match = {};

    if (userData.availableDate && userData.availableDate != "") {
      let date = new Date();
      var crntDate = date.toISOString().split("T")[0] + "T00:00:00";
      console.log(crntDate);
      match.available_date = { $gte: crntDate, $lte: userData.availableDate };
    }
    if (userData.budget && userData.budget != "") {
      match.rent = { $gte: userData.budget.split("-")[0], $lte: userData.budget.split("-")[1] };
    }
    if (userData.gender && userData.gender.length > 0) {
      for (let index = 0; index < userData.gender.length; index++) {
        userData.gender[index] = userData.gender[index].toUpperCase();
      }
      match.gender = { $in: userData.gender };
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
    // match.deleted = false;
    // match.status = true;
    // match.user = { $ne: req.doc.id };
    if (userData.searchString) {
      match["$or"] = [
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
          location: new RegExp(userData.searchString, "i"),
        },
      ];
    }
    let propertyData = await Property.find(match)
      .populate(["user"])
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(perPage);

    if (!propertyData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    let totalCount = await Property.countDocuments(match);
    return res.status(200).json({
      result: propertyData,
      totalCount,
      message: langFunction("en", "success"),
    });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

// -------------------------------------------------------------

/**
 * @function  getByPropertyId
 * @description API Will be /api/v1/c/request-place/getByPropertyId
 * @example getByPropertyId
 */

router.post("/getByPropertyId", async (req, res) => {
  try {
    const propertyData = await Property.findOne({
      _id: req.body.propertyId,
    }).populate(["user"]);
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
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getPropertyByUserId
 * @description API Will be /api/v1/c/request-place/getPropertyByUserId
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
          location: new RegExp(userData.searchString, "i"),
        },
      ];
    }

    let propertyData = await Property.find(con, {}, skipCondition).populate(["user"]);

    if (!propertyData) {
      return res.status(400).json({
        message: langFunction("en", "propertyfound"),
      });
    }
    let totalCount = await Property.countDocuments(con);
    return res.status(200).json({
      result: propertyData,
      totalCount,
      message: langFunction("en", "sucess"),
    });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  update
 * @description API Will be /api/v1/c/request-place/update
 * @example update
 */

router.post("/update/:id", async (req, res) => {
  let userData = req.body;
  let propertyScehma = Joi.object({
    budget: Joi.number()
      .required()
      .messages({
        "*": `budget ${langFunction("en", "fieldmissing")}`,
      }),
    location: Joi.string()
      .required()
      .messages({
        "*": `location ${langFunction("en", "fieldmissing")}`,
      }),
    coordinates: {
      lat: Joi.string()
        .required()
        .messages({
          "*": `lat ${langFunction("en", "fieldmissing")}`,
        }),
      lng: Joi.string()
        .required()
        .messages({
          "*": `lng ${langFunction("en", "fieldmissing")}`,
        }),
    },
    available_date: Joi.string()
      .required()
      .messages({
        "*": `available_date ${langFunction("en", "fieldmissing")}`,
      }),
    lease_term: Joi.string()
      .required()
      .messages({
        "*": `lease_term ${langFunction("en", "fieldmissing")}`,
      }),
    house_type: Joi.string()
      .required()
      .messages({
        "*": `house_type ${langFunction("en", "fieldmissing")}`,
      }),
    space_type: Joi.string()
      .required()
      .messages({
        "*": `space_type ${langFunction("en", "fieldmissing")}`,
      }),
    furnishing: Joi.string()
      .required()
      .messages({
        "*": `rent ${langFunction("en", "fieldmissing")}`,
      }),
    range: Joi.string()
      .required()
      .messages({
        "*": `range ${langFunction("en", "fieldmissing")}`,
      }),
    gender: Joi.string()
      .required()
      .messages({
        "*": `gender ${langFunction("en", "fieldmissing")}`,
      }),
    occupants: Joi.string()
      .required()
      .messages({
        "*": `occupants ${langFunction("en", "fieldmissing")}`,
      }),
    pets: Joi.string()
      .required()
      .messages({
        "*": `pets ${langFunction("en", "fieldmissing")}`,
      }),
    smoker: Joi.string()
      .required()
      .messages({
        "*": `smoker ${langFunction("en", "fieldmissing")}`,
      }),
    help_offered: Joi.string()
      .required()
      .messages({
        "*": `help_offered ${langFunction("en", "fieldmissing")}`,
      }),
    status: Joi.boolean()
      .required()
      .messages({
        "*": `status ${langFunction("en", "fieldmissing")}`,
      }),
  });

  const { error } = propertyScehma.validate(userData);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      error,
    });
  }

  try {
    let data = await Property.updateOne({ _id: req.params.id }, { ...userData }, { upsert: true });

    return res.status(200).json({
      message: langFunction("en", "dataupdated"),
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: langFunctioa("en", "servererr"),
    });
  }
});

/**
 * @function  delete
 * @description API Will be /api/v1/c/request-place/delete
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
 * @description API Will be /api/v1/c/request-place/status
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
