const express = require('express');
const router = express.Router();
const Information = require('../../models/information');
const CMS = require("../../common-modules/index");
const Joi = require('joi');
const mobilecodes = require("../../models/mobilecodes");
const langFunction = CMS.Lang_Messages



/**
 * @function  Update_terms-and-conditions
 * @description API Will be /api/v1/a/terms-and-conditions/update
 * @example Update_terms-and-conditions
 */

 router.post('/terms-and-conditions/update', async (req, res) => {
    try {
        let termsData = req.body;

        let validator = Joi.object({
            section: Joi.string().required().messages({
                '*': `section ${langFunction("en", "feildmissing")}`
            })
        })

        let {
            error
        } = validator.validate(termsData);
        if (error) {
            return res.status(400).json({
                "message": error.details[0].message,
                error
            });
        }

        let data = await Information.findOne({
                key: 'terms_condition'
            })
            if (data) {
                data.section = termsData.section

                let doc = await data.save()
                return res.status(200).json({
                    message: CMS.Lang_Messages('en', 'updatedtc'),
                    "data": doc,
                });
            } else {
                return res.status(400).json({
                    message: CMS.Lang_Messages('en', 'informationnotfound'),
                });
            }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})


/**
 * @function  Get_All_Terms_Condition
 * @description API Will be /api/v1/a/terms-and-conditions/get
 * @example Get_All_Terms_Condition
 */

 router.get('/terms-and-conditions/get', async (req, res) => {
    try {
        let data = await Information.findOne({ key: 'terms_condition' })
        res.status(200).json({
            message: CMS.Lang_Messages('en', 'success'),
            "data": data,
        });
 } catch (error) {
        console.error(error);
        res.status(500).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})


/**
 * @function  Update_privacy-policy
 * @description API Will be /api/v1/a/privacy-policy/update
 * @example Update_privacy-policy
 */

 router.post('/privacy-policy/update', async (req, res) => {
    try {
        let termsData = req.body;

        let validator = Joi.object({
            section: Joi.string().required().messages({
                '*': `section ${langFunction("en", "feildmissing")}`
            })
        })

        let {
            error
        } = validator.validate(termsData);
        if (error) {
            return res.status(400).json({
                "message": error.details[0].message,
                error
            });
        }

        let data = await Information.findOne({
                key: 'privacy_policy'
            })
            if (data) {
                data.section = termsData.section

                let doc = await data.save()
                return res.status(200).json({
                    message: CMS.Lang_Messages('en', 'updatedpp'),
                    "data": doc,
                });
            } else {
                return res.status(400).json({
                    message: CMS.Lang_Messages('en', 'informationnotfound'),
                });
            }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})


/**
 * @function  Get_All_privacy-policy
 * @description API Will be /api/v1/a/privacy-policy/get
 * @example Get_All_privacy-policy
 */

 router.get('/privacy-policy/get', async (req, res) => {
    try {
        let data = await Information.findOne({ key: 'privacy_policy' })
        res.status(200).json({
            message: CMS.Lang_Messages('en', 'success'),
            "data": data,
        });
 } catch (error) {
        console.error(error);
        res.status(500).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})


/**
 * @function  Update_cancelation_policy
 * @description API Will be /api/v1/a/cancellation-policy/update
 * @example Update_cancelation_policy
 */

 router.post('/cancellation-policy/update', async (req, res) => {
    try {
        let termsData = req.body;

        let validator = Joi.object({
            section: Joi.string().required().messages({
                '*': `section ${langFunction("en", "feildmissing")}`
            })
        })

        let {
            error
        } = validator.validate(termsData);
        if (error) {
            return res.status(400).json({
                "message": error.details[0].message,
                error
            });
        }

        let data = await Information.findOne({
                key: 'cancelation_policy'
            })
            if (data) {
                data.section = termsData.section

                let doc = await data.save()
                return res.status(200).json({
                    message: CMS.Lang_Messages('en', 'updatedcp'),
                    "data": doc,
                });
            } else {
                return res.status(400).json({
                    message: CMS.Lang_Messages('en', 'informationnotfound'),
                });
            }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})


/**
 * @function  Get_All_cancelation_policy
 * @description API Will be /api/v1/a/cancellation-policy/get
 * @example Get_All_cancelation_policy
 */

 router.get('/cancellation-policy/get', async (req, res) => {
    try {
        let data = await Information.findOne({ key: 'cancelation_policy' })
        res.status(200).json({
            message: CMS.Lang_Messages('en', 'success'),
            "data": data,
        });
 } catch (error) {
        console.error(error);
        res.status(500).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})


/**
 * @function  Update_about
 * @description API Will be /api/v1/a/about/update
 * @example Update_about
 */

router.post('/about/update', async (req, res) => {
    try {
        let termsData = req.body;

        let validator = Joi.object({
            section: Joi.string().required().messages({
                '*': `section ${langFunction("en", "feildmissing")}`
            })
        })

        let {
            error
        } = validator.validate(termsData);
        if (error) {
            return res.status(400).json({
                "message": error.details[0].message,
                error
            });
        }

        let data = await Information.findOne({
                key: 'about'
            })
            if (data) {
                data.section = termsData.section

                let doc = await data.save()
                return res.status(200).json({
                    message: CMS.Lang_Messages('en', 'updatedabout'),
                    "data": doc,
                });
            } else {
                return res.status(400).json({
                    message: CMS.Lang_Messages('en', 'informationnotfound'),
                });
            }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})


/**
 * @function  Get_About_Section
 * @description API Will be /api/v1/a/about/get
 * @example Get_About_Section
 */

router.get('/about/get', async (req, res) => {
    try {
        let data = await Information.findOne({ key: 'about' })
        res.status(200).json({
            message: CMS.Lang_Messages('en', 'success'),
            "data": data,
        });
 } catch (error) {
        console.error(error);
        res.status(500).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})

/**
 * @function  GET_Mobile_Codes
 * @description API Will be /api/v1/a/mobilecodes
 * @example GET_Mobile_Codes
 */
router.get('/mobilecodes/', (req, res) => {
  try {
    return res.status(200).json({
      message: langFunction("en", "success"),
      mobilecodes,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({message: langFunction("en", "servererr")});
  }
})

/**
 * @function  POST_Mobile_Code
 * @description API Will be /api/v1/a/mobilecodes
 * @example POST_Mobile_Code
 */
router.post("/mobilecodes/", (req, res) => {
  try {
    const userData = req.body;
    mobilecodes.forEach(mc => {
      if(mc.dial_code === userData.dial_code){
        mc.approved = userData.approved;
      }
    })

    return res.status(200).json({message: langFunction("en", "success")})
  } catch (e) {
    console.log(e);
    return res.status(400).json({message: langFunction("en", "servererr")});
  }
})


module.exports = router;
