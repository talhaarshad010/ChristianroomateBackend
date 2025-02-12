const express = require("express");
const router = express.Router();
const Testimonial = require("../../models/testimonials");
const config = require("../../common-modules/config");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * @function  getAll
 * @description API Will be /api/v1/c/testimonial/getAll
 * @example getAll
 */

router.get("/getAll", async (req, res) => {
    try {
      const testimonialData = await Testimonial.find({
        deleted:false,
        status: true
      }).sort({_id:-1}).populate("image");
      if (!testimonialData) {
        return res.status(400).json({
          message: langFunction("en", "NoTestimonials"),
        });
      }
      console.log(global.Testimonial)
      return res.status(200).json({
        data: testimonialData,
      });
    } catch (error) {
      return res.status(400).json({
        message: langFunction("en", "servererr"),
      });
    }
  });

module.exports = router;
