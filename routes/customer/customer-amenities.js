const express = require('express');
const router = express.Router();
const Amenities = require('../../models/amenities');
const Joi = require('joi');
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;



/**
 * @function  getAll
 * @description API Will be /api/v1/c/amenities/getAll
 * @example getAll
 */

router.get('/getAll', async (req, res) => {
    try {
        let doc =  await Amenities.find({status: true});
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
