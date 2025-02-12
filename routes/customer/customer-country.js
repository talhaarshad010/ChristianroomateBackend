const express = require("express");
const router = express.Router();
const CMS = require("../../common-modules/index");
const Joi = require("joi");
const langFunction = CMS.Lang_Messages;
const CountryDB = require("../../models/country");

/**
 * @function  Get_Country_BY_Id
 * @description API Will be /api/v1/c/country/get/:id
 * @example Get_Country_BY_Id
 */

router.get("/get/:id", async (req, res) => {
  try {
    let data = await CountryDB.findOne({
      _id: req.params.id,
      isAllowed: true,
    });
    if (data) {
      return res.status(200).json({
        message: langFunction("en", "success"),
        data: data,
      });
    } else {
      return res.status(400).json({
        message: langFunction("en", "invalidcountryid"),
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
 * @function  Get_All_Country
 * @description API Will be /api/v1/c/country/getAll
 * @example Get_All_Country
 */

router.get("/getAll", async (req, res) => {
  try {
    let data = await CountryDB.find({
      isAllowed: true,
    }).sort({countryName: 1});
    if (data) {
      return res.status(200).json({
        message: langFunction("en", "success"),
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
 * @function  Get_Country_Pagin
 * @description API Will be /api/v1/c/country/pagin
 * @example Country_Pagin
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
      sort: { countryName: 1 },
    };
    let con = { isAllowed: true };

    if (userData.searchString) {
      con["$and"] = [
        {
          countryName: new RegExp(userData.searchString, "i"),
        },
        { isAllowed: true },
      ];
    }

    let doc = await CountryDB.find(con, {}, skipCondition);
    let totalCount = await CountryDB.countDocuments(con);
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

module.exports = router;
