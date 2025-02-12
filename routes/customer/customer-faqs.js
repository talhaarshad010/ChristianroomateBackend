const express = require("express");
const router = express.Router();
const Faqs = require("../../models/faqs");
const config = require("../../common-modules/config");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * @function  getAll
 * @description API Will be /api/v1/c/faqs/getAll
 * @example getAll
 */

 router.get('/getAll', async (req, res) => {
  try {
      let doc =  await Faqs.find({
        status:true,
        deleted:false,
      })
      return res.status(200).json({
          "result": doc,
          "message": langFunction('en', 'success'),
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          message: langFunction('en', 'servererr')            
      });             
  }
})

module.exports = router;