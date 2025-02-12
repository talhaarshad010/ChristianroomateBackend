const express = require("express");
const router = express.Router();
const CMS = require("../../common-modules/index");
const langFunction = CMS.Lang_Messages;
let Country = require("country-state-city").Country;

/**
 * @function  Get_Country_Pagin
 * @description API Will be /api/v1/a/openCountry/getAll
 * @example Country_Pagin
 */

router.get("/getAll", async (req, res) => {
  try {
    
    const doc = Country.getAllCountries();

    return res.status(200).json({
      result: doc,
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