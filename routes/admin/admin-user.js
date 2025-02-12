const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../../models/admin');
const config = require('../../common-modules/config');
const CM = require('../../common-modules/index');
const langFunction = CM.Lang_Messages
const Joi = require('joi');

/**
 * @function  Admin_Insert
 * @description API Will be /api/v1/admins/insert
 * @example Admin_Insert
 */

router.post('/insert', async (req, res) => {
    try {
        if (req.doc.role === 'ADMIN') {
            
            let userData = req.body;
            let validator = Joi.object({
                name: Joi.string().required().messages({
                    '*': `name ${langFunction("en", "feildmissing")}`
                }),
                email: Joi.string().required().messages({
                    '*': `email ${langFunction("en", "feildmissing")}`
                }),
                password: Joi.string().required().messages({
                    '*': `password ${langFunction("en", "feildmissing")}`
                }),
                phone: Joi.string().required().messages({
                    '*': `phone ${langFunction("en", "feildmissing")}`
                }),
                role : Joi.string().allow('', null)
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

            if (!config.phonenumbervalidator(userData.phone)) {
                return res.status(400).json({
                    "message": langFunction('en', 'phonenotmatch')
                })
            }

            let user = await Admin.findOne({
                email: userData.email
            }).select("+password");
            if (user) {
                return res.status(400).json({
                    "message": langFunction('en', 'accountcreatealready')
                });
            }
            const salt = bcrypt.genSaltSync(10);
            let hash = await bcrypt.hash(userData.password, salt)
            let newAdmin = new Admin();
            newAdmin.email = userData.email;

            if (!userData.role) {
                newAdmin.role = "ADMIN"
            } else {
                newAdmin.role = userData.role
            }

            newAdmin.name = userData.name;
            newAdmin.phone = userData.phone;
            newAdmin.password = hash;

            if (userData.userImage) {
                newAdmin.userImage = userData.userImage;
            }

            newAdmin.save(function (err, user) {
                if (err) {
                    console.log(err)
                    return res.status(400).json({
                        "message": err
                    })
                } else {
                    delete user._doc.password
                    return res.status(200).json({
                        message: langFunction('en', 'newadmin'),
                        "data": user,
                    });
                }
            })

        } else {
            return res.status(400).json({
                message: langFunction('en', 'notAuthorizedcreate'),
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  Get_Admin_BY_Id
 * @description API Will be /api/v1/a/admins/get/:id
 * @example Get_Admin_BY_Id
 */

router.get('/get/:id', async (req, res) => {
    try {
        let data = await Admin.findOne({
            _id: req.params.id
        }).populate("userImage")
        if (data) {
            return res.status(200).json({
                message: langFunction('en', 'success'),
                "data": data,
            });
        }
        return res.status(400).json({
            message: langFunction('en', 'adminnotfound'),
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  Admin_Update
 * @description API Will be /api/v1/a/admins/update/:id
 * @example Admin_Update
 */

router.post('/update/:id', async (req, res) => {
    try {
        let userData = req.body;
        let validator = Joi.object({
            name: Joi.string().required().messages({
                '*': `name ${langFunction("en", "feildmissing")}`
            }),
            email: Joi.string().required().messages({
                '*': `email ${langFunction("en", "feildmissing")}`
            }),
            userImage: Joi.string().required().messages({
                '*': `userImage ${langFunction("en", "feildmissing")}`
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

        let user = await Admin.findOne({_id : req.params.id})
        if (user) {
            let userEmail = await Admin.findOne({
                email: userData.email , 
                _id : { $ne : req.params.id}
            }).select("+password");
            if(userEmail){
                return res.status(400).json({
                    "message": langFunction('en', 'accountcreatealready')
                })
            }

            let data = await Admin.updateOne(
                { _id: req.params.id },
                {
                    userData
                })

            return res.status(200).json({
                message: langFunction('en', 'dataupdated'),
                "data": data,
            });
        }
        return res.status(400).json({
            message: langFunction('en', 'adminnotfound'),
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  Admin_DisabledAndEnabled
 * @description API Will be /api/v1/a/admins/enabledordisabled/:id
 * @example Admin DisabledAndEnabled
 */

router.post('/enabledordisabled/:id', async (req, res) => {
    try {
        if (req.doc.role === 'ADMIN') {
            let userData = req.body;
            let user = await Admin.findOne({
                _id: req.params.id
            })
            if (user) {
                let data = await Admin.updateOne(
                    { _id: req.params.id },
                    {
                        $set: {
                            enabled: userData.enabled
                        }
                    })

                return res.status(200).json({
                    message: langFunction('en', 'dataupdated'),
                    "data": data,
                });
            }
            return res.status(400).json({
                message: langFunction('en', 'adminnotfound'),
            });
        } 
        return res.status(400).json({
            message: langFunction('en', 'notAuthorized'),
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  Admin_Pagin
 * @description API Will be /api/v1/a/admins/pagin
 * @example Admin_Get_Pagin
 */

router.post('/pagin', async (req, res) => {
    try {
        let userData = req.body;

        let validator = Joi.object({
            page: Joi.number().required().messages({
                '*': `page ${langFunction("en", "feildmissing")}`
            }),
            perPage: Joi.number().required().messages({
                '*': `perPage ${langFunction("en", "feildmissing")}`
            }),
            searchString: Joi.string().allow('', null)
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

        let startIndex = ((userData.page - 1) * userData.perPage);
        let perPage = parseInt(userData.perPage);
        skipCondition = {
            skip: startIndex,
            limit: perPage,
            sort: { 'createdAt': -1 }
        };
        let con = {
        }

        if (userData.searchString) {
            con['$or'] = [
                {
                    'email': new RegExp(userData.searchString, 'i')
                },
                {
                    'name': new RegExp(userData.searchString, 'i')
                },
                {
                    'phone': new RegExp(userData.searchString, 'i')
                }
            ]
        }

        let doc = await Admin.find(
            con, {},
            skipCondition
        )
        let totalCount = await Admin.countDocuments(con);
        return res.status(200).json({
            "result": doc,
            totalCount,
            "message": langFunction('en', 'success'),
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr')
        });
    }
})



/**
 * @function  API_refresh_token
 * @description API Will be /api/v1/a/admins/token/refresh
 * @example API_token_refresh
 */

router.get('/token/refresh', async (req, res) => {
    try {
        let payLoadNew = {
            id: req.doc.id,
            role: req.doc.role
        };
        let tokenNew = jwt.sign(payLoadNew, process.env.ADMIN_KEY, {
            expiresIn: "24h" // expires in 1 Day
        });
        return res.json({ 
            token: tokenNew ,
            role :req.doc.role
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  API_ChangeOwnPassword
 * @description API Will be /api/v1/a/admins/change_password
 * @example API_ChangeOwnPassword
 */

router.post('/change_password', async (req, res) => {
    try {
        let userData = req.body;

        let validator = Joi.object({
            password: Joi.string().required().messages({
                '*': `password ${langFunction("en", "feildmissing")}`
            }),
            confirmPassword: Joi.string().required().messages({
                '*': `confirmPassword ${langFunction("en", "feildmissing")}`
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

        if (userData.password !== userData.confirmPassword) {
            return res.status(400).json({
                "message": langFunction('en', 'confirmpassword')
            });
        }
        let user = await Admin.findOne({ _id: req.doc.id })

        if (user) {
            const salt = bcrypt.genSaltSync(10);
            let hash = await bcrypt.hash(userData.password, salt)
            user.password = hash
            user.save();
            return res.status(200).json({
                "message": langFunction('en', 'passupdated'),
                "data": user,
            });
        }
        return res.status(400).json({
            message: langFunction('en', 'adminnotfound'),
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    }
})



/**
 * @function  API_ChangeOtherPassword
 * @description API Will be /api/v1/a/admins/change_other_password/:id
 * @example API_ChangeOtherPassword
 */

router.post('/change_other_password/:id', async (req, res) => {
    try {
        let userData = req.body;

        let validator = Joi.object({
            password: Joi.string().required().messages({
                '*': `password ${langFunction("en", "feildmissing")}`
            }),
            confirmPassword: Joi.string().required().messages({
                '*': `confirmPassword ${langFunction("en", "feildmissing")}`
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

        if (userData.password !== userData.confirmPassword) {
            return res.status(400).json({
                "message": langFunction('en', 'confirmpassword')
            });
        }
        let user = await Admin.findOne({ _id: req.params.id , role:"ADMIN"})
        if (user) {
            const salt = bcrypt.genSaltSync(10);
            let hash = await bcrypt.hash(userData.password, salt)
            user.password = hash
            user.save();
            return res.status(200).json({
                "message": langFunction('en', 'passupdated'),
                "data": user,
            });
        }
        return res.status(400).json({
            message: langFunction('en', 'adminnotfound'),
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


module.exports = router;