const express = require("express");
const router = express.Router();
const CMS = require("../../common-modules/index");
const Joi = require("joi");
const langFunction = CMS.Lang_Messages;
const CountryDB = require("../../models/country");
let Country = require("country-state-city").Country;
let State = require("country-state-city").State;

/**
 * @function  Add_Country
 * @description API Will be /api/v1/a/country/add
 * @example Add_Country
 */

router.post("/add", async (req, res) => {
  const userData = req.body;
  try {
    const validator = Joi.object({
      countryCode: Joi.string()
        .required()
        .messages({
          "*": `countryCode ${langFunction("en", "feildmissing")}`,
        }),
      isAllowed: Joi.boolean().allow(null),
    });

    let { error } = validator.validate(userData);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        error,
      });
    }

    const response = await CountryDB.findOne({
      countryCode: userData.countryCode,
    });

    if (response) {
      console.log(response);
      return res.status(400).json({
        message: langFunction("en", "countryExists"),
      });
    }

    const countryData = Country.getCountryByCode(userData.countryCode);
    const stateData = State.getStatesOfCountry(userData.countryCode);

    const newCountry = CountryDB({
      countryName: countryData.name,
      countryCode: countryData.isoCode,
      mobileCode: countryData.phonecode,
      isAllowed: userData.isAllowed || true,
      states: stateData,
    });

    const doc = await newCountry.save();

    return res.status(200).json({
      message: langFunction("en", "success"),
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
 * @function  Get_Country_BY_Id
 * @description API Will be /api/v1/a/country/get/:id
 * @example Get_Country_BY_Id
 */

router.get("/get/:id", async (req, res) => {
  try {
    let data = await CountryDB.findOne({
      _id: req.params.id,
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
    return res.status(500).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  Get_Country_Pagin
 * @description API Will be /api/v1/a/country/pagin
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
    let con = {};

    if (userData.searchString) {
      con["$or"] = [
        {
          countryName: new RegExp(userData.searchString, "i"),
        },
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

/**
 * @function  Update_Country
 * @description API Will be /api/v1/a/country/updateStatus/:id
 * @example Update_Country
 */

router.post("/updateStatus/:id", async (req, res) => {
  try {
    let data = await CountryDB.updateOne(
      {
        _id: req.params.id,
      },
      { isAllowed: req.body.status }
    );
    if (data) {
      return res.status(200).json({
        message: langFunction("en", "success"),
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

module.exports = router;
