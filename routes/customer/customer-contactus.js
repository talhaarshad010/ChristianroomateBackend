const express = require("express");
const router = express.Router();
const Contact = require("../../models/contactus");
const config = require("../../common-modules/config");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * @function  add
 * @description API Will be /api/v1/c/contact/add
 * @example add
 */

 router.post('/add', async (req, res) => {
  try {
     
          let contactData = req.body;
          let validator = Joi.object({
            // code: Joi.string().when('phone', {
            //     is: Joi.exist(),
            //     then: Joi.string().required().messages({
            //         '*': `code ${langFunction("en", "feildmissing")}`
            //     }),
            //     otherwise: Joi.string().allow("", null)
            // }),
            // email: Joi.string().when('phone', {
            //     is: Joi.exist(),
            //     then: Joi.string().allow("", null),
            //     otherwise: Joi.string().email().required().messages({
            //         '*': `email ${langFunction("en", "feildmissing")}`
            //     })
            // }),
            code:Joi.string().allow("", null),
            email:Joi.string().allow("", null),
            phone:Joi.string().allow("", null),
            name: Joi.string().required().messages({
              '*': `name ${langFunction("en", "feildmissing")}`
          }),
            message: Joi.string().required().messages({
                '*': `message ${langFunction("en", "feildmissing")}`
            }),
          })
  
          let {
              error
          } = validator.validate(contactData);
          if (error) {
              return res.status(400).json({
                  "message": error.details[0].message,
                  error
              });
          }
          if(contactData?.email){
            if (!config.emailvalidator(contactData?.email)) {
                return res.status(400).json({
                    "message": langFunction('en', 'emailnotmatch')
                })
            }
          }
          if(contactData?.phone){
            if (!config.phonenumbervalidator(contactData?.phone)) {
                return res.status(400).json({
                    "message": langFunction('en', 'phonenotmatch') 
                })
            }
          }
          
          const contact = Contact({
            code:contactData.code,
            name:contactData.name,
            email: contactData.email,
            phone: contactData.phone,
            message:contactData.message,
            status: true,
            deleted:false,
          });
          let conData = await contact.save();
          return res.status(200).json({
      
            message: langFunction("en", "thanksForContacting"),
            data: conData,
          });

      
  } catch (error) {
      console.error(error);
      return res.status(400).json({
          message: langFunction('en', 'servererr'),
      });
  }
})


module.exports = router;