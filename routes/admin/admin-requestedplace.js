const express = require("express");
const router = express.Router();
const Property = require("../../models/requestedProperty");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const Bookmark = require("../../models/bookmark");

/**
 * @function  getAll
 * @description API Will be /api/v1/a/request-place/getAll
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
    let propertyData = await Property.find({ ...match })
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

module.exports = router;