const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Testimonial = require('../../models/testimonials');
const config = require('../../common-modules/config');
const CM = require('../../common-modules/index');
const langFunction = CM.Lang_Messages
const Joi = require('joi');


/**
 * @function  add
 * @description API Will be /api/v1/a/testimonial/add
 * @example add
 */

router.post('/add', async (req, res) => {
    try {
      console.log(req.body)
            let testimonialData = req.body;
            let validator = Joi.object({
              name: Joi.string()
                .required()
                .messages({
                  "*": `name ${langFunction("en", "feildmissing")}`,
                }),
              text: Joi.string()
                .required()
                .messages({
                  "*": `text ${langFunction("en", "feildmissing")}`,
                }),
                place: Joi.string()
                .required()
                .messages({
                  "*": `place ${langFunction("en", "feildmissing")}`,
                }),
                image: Joi.string(),
            });

            let { error } = validator.validate(testimonialData);
            if (error) {
             return res.status(400).json({
             message: error.details[0].message,
             error,
            });
           }


            const testimonial = Testimonial({
                text: testimonialData.text,
                name: testimonialData.name,
                place: testimonialData.place,
                image: testimonialData.image,
                status: true,
                deleted:false,
              });
              let tesData = await testimonial.save();
              return res.status(200).json({

                message: 'Testimonial has been added successfully',
                data: tesData,
              });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  getAll
 * @description API Will be /api/v1/a/testimonial/getAll
 * @example getAll
 */
router.post("/getAll", async (req, res) => {
  try {
    let userData = req.body;
  
        let validator = Joi.object({
          page: Joi.number()
            .required()
            .messages({
              '*': `page ${langFunction('en', 'feildmissing')}`,
            }),
          perPage: Joi.number()
            .required()
            .messages({
              '*': `perPage ${langFunction('en', 'feildmissing')}`,
            }),
          searchString: Joi.string().allow('', null),
        });

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
        if (userData.searchString) {
          con['$or'] = [
              {
                  'name': new RegExp(userData.searchString, 'i')
              },
              {
                  'text': new RegExp(userData.searchString, 'i')
              },
          ]
      }
    const testimonialData = await Testimonial.find(con,{},skipCondition).sort({_id:-1}).populate("image");
    if (!testimonialData) {
      return res.status(400).json({
        message: langFunction("en", "No Testimonials"),
      });
    }
    let totalCount = await Testimonial.countDocuments(con);
    return res.status(200).json({
      data: testimonialData, totalCount,
      "message": langFunction('en', 'success'),
    });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});



/**
 * @function  getByTestId
 * @description API Will be /api/v1/a/testimonial/getByTestId
 * @example getByTestId
 */

 router.post("/getByTestId", async (req, res) => {
  try {
    let testimonialData = req.body;
    const test = await Testimonial.findOne({
      _id: testimonialData.testid,
      deleted:false
      }).populate("image");
      if(!test){
        return res.status(400).json({
          message: "Testimonial not found",
          });
      }

    return res.status(200).json({
      message: langFunction("en", "success"),
      data: test,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  update
 * @description API Will be /api/v1/a/testimonial/update
 * @example update
 */

 router.post("/update", async (req, res) => {
  try {
    let testimonialData = req.body;
    const test = await Testimonial.findOne({
      _id: testimonialData.testid,
      });
      if(!test){
        return res.status(400).json({
          message: "Testimonial not found",
          });
      }
      let data = await Testimonial.updateOne(
              { _id: testimonialData.testid},
              {   ...testimonialData},
              { upsert: true }
            );

    return res.status(200).json({
      message: langFunction("en", "testimonialUpdated"),
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
 * @function  delete
 * @description API Will be /api/v1/a/testimonial/delete
 * @example delete
 */

 router.post("/delete", async (req, res) => {
  try {
    let testimonialData = req.body;

    const test = await Testimonial.findOne({
          _id: testimonialData.testid,
          });
          if(!test){
            return res.status(400).json({
              message: "Testimonial not found",
              });
          }
          let data = await Testimonial.updateOne(
                  { _id: testimonialData.testid},
                  {
                    $set: {
                      deleted: true,
                    },
                  }
                );
    return res.status(200).json({  
      message: langFunction("en", "testimonialDeleted"),
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

module.exports = router;
