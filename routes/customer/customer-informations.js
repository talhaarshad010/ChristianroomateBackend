const express = require('express');
const router = express.Router();
const Information = require('../../models/information');
const Pages = require('../../models/pages');
const CMS = require("../../common-modules/index");
const mobilecodes = require("../../models/mobilecodes");
const langFunction = CMS.Lang_Messages


/**
 * @function  Get_Terms_Condition
 * @description API Will be /api/v1/c/terms-and-conditions/get
 * @example Get_Terms_Condition
 */

 router.get('/page/:pageName', async (req, res) => {
    try {
        let data = await Information.findOne({ key: req.params.pageName })
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
 router.get('/pageName/:pageName', async (req, res) => {
    try {
        let data = await Pages.findOne({ pagePath: req.params.pageName })
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
 * @function  Get_Terms_Condition
 * @description API Will be /api/v1/c/terms-and-conditions/get
 * @example Get_Terms_Condition
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
 * @function  Get_privacy-policy
 * @description API Will be /api/v1/c/privacy-policy/get
 * @example Get_privacy-policy
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
 * @function  Get_cancelation_policy
 * @description API Will be /api/v1/c/cancellation-policy/get
 * @example Get_cancelation_policy
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
 * @function  Get_About_Section
 * @description API Will be /api/v1/c/about/get
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
 * @description API Will be /api/v1/c/mobilecodes
 * @example GET_Mobile_Codes
 */
router.get('/mobilecodes/', (req, res) => {
  try {
    const approvedCodes = mobilecodes.filter(mc => mc.approved === true);
    return res.status(200).json({
      message: langFunction("en", "success"),
      approvedCodes,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({message: langFunction("en", "servererr")});
  }
})



module.exports = router;
