const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../models/admin');
const crypto = require('crypto')
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const CM = require('../../common-modules/index')
const Email = CM.EMAIL
const config = CM.Config
const langFunction = CM.Lang_Messages

/**
 * @function  Admin_Login
 * @description API Will be /api/v1/a/login 
 * @example Admin_Login
 */
router.post('/login', async (req, res) => {
  
    try {
        
    let userData = req.body;
    
    let validator = Joi.object({
        email: Joi.string().required().messages({
            '*': `email ${langFunction("en", "feildmissing")}`
        }),
        password: Joi.string().required().messages({
            '*': `password ${langFunction("en", "feildmissing")}`
        }),
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

    if (!config.emailvalidator(userData.email)) {
        return res.status(400).json({
            "message": langFunction('en', 'emailnotmatch')
        })
    }
    
    let responseBody = {
        "name": "",
        "_id":'',
        "phone": "",
        "email": "",
        "userImage": "",
        "message": "",
        "token": ""
    }
    let user =  await User.findOne({
        email: userData.email, "isDeleted" : false
        }).select("+password");
        if (!user) {
            return res.status(400).json({
            ...responseBody,
            message: langFunction('en', 'canntfind')
            });
        }
        
        let verify = await bcrypt.compare(userData.password, user.password)
        if (!verify) {
            return res.status(400).json({
                message: langFunction('en', 'wrngpass')
            });
        }
        let payLoad = {
            "id": user._id,
            "role":user.role
        };
        let token = jwt.sign(payLoad, process.env.ADMIN_KEY, {
            expiresIn: '2h' // expires in 1 Day
        });
        return  res.status(200).json({
            ...responseBody,
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
            "_id": user._id,
            "userImage": user.userImage,
            "message":  langFunction('en', 'loginsuccess'),
            "token": token,
            "role":user.role
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    } 
})


module.exports = router;