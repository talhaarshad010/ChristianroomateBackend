const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Contact = require('../../models/contactus');
const config = require('../../common-modules/config');
const CM = require('../../common-modules/index');
const langFunction = CM.Lang_Messages
const Joi = require('joi');
const path = require("path");
const csv=CM.Csv
const findRemoveSync = require("find-remove")
const CMS = require("../../common-modules");

/**
 * @function  getAll
 * @description API Will be /api/v1/a/contact/getAll
 * @example getAll
 */
 router.post("/getAll", async (req, res) => {
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
          deleted:false
        }
      const contactData = await Contact.find(con,{},skipCondition).sort({_id:-1});
      if (!contactData) {
        return res.status(400).json({
          message: langFunction("en", "No Contact us"),
        });
      }
      let totalCount = await Contact.countDocuments(con);
      return res.status(200).json({
        data: contactData,totalCount,
        "message": langFunction('en', 'success'),
      });
    } catch (error) {
      return res.status(400).json({
        message: langFunction("en", "servererr"),
      });
    }
  });

/**
 * @function  getById
 * @description API Will be /api/v1/a/contact/getById
 * @example getById
 */
router.get("/getById/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let con = {
      deleted:false,
      _id: id
    }
    const contactData = await Contact.find(con)
    if (!contactData) {
      return res.status(400).json({
        message: langFunction("en", "No Contact us"),
      });
    }
    return res.status(200).json({
      data: contactData,
      "message": langFunction('en', 'success'),
    });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

  /**
 * @function  delete
 * @description API Will be /api/v1/a/contact/delete
 * @example delete
 */

 router.post("/delete", async (req, res) => {
    try {
      const test = await Contact.findOne({
            _id: req.body.cid,
            });
            if(!test){
              return res.status(400).json({
                message: "contact us not found",
                });
            }
            let data = await Contact.updateOne(
                    { _id: req.body.cid},
                    {
                      $set: {
                        deleted: true,
                      },
                    }
                  );
      return res.status(200).json({
        message: "Contact query has been deleted successfully",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: langFunction("en", "servererr"),
      });
    }
  });

/**
 * @function  export
 * @description API Will be  /api/v1/a/contact/export
 * @example exportCSV
 */
 router.get("/export", async (req, res) => {
    try {

      let doc = await Contact.aggregate([{$match: {deleted: false}}, {$project: {_id: 0,  submitTime: "$createdAt", name: 1, email: 1, phone: 1, message: 1}}]);

      sortOrder = ["SNo","name","email","phone","message","submitTime"];

      doc = CMS.SortObj(doc, sortOrder);

      if(doc.length>0){
        const csvFileName=await csv(doc);
        const opt = {
          root: path.join(__dirname, "../..", "csv"),
        };

        res.sendFile(`${csvFileName}.csv`, opt);
           setTimeout(() => {
                const csvpath = path.join(__dirname, "../../")
                const result = findRemoveSync(csvpath, {
                  dir: 'csv',
                });
          }, 100);
          return;
      }else{

        return res.status(500).json({
            message: langFunction('en', 'error')
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
