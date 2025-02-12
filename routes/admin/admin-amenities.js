const express = require('express');
const router = express.Router();
const Amenities = require('../../models/amenities');
const CM = require("../../common-modules/index");
const Joi = require('joi');
const langFunction = CM.Lang_Messages

/**
 * @function  Amenities_Insert
 * @description API Will be /api/v1/a/amenities/insert
 * @example Amenities_Insert
 */

 router.post('/insert', async (req, res) => {
    try {


        let userData = req.body;
        let validator = Joi.object({
            name: Joi.string().required().messages({
                '*': `name ${langFunction("en", "feildmissing")}`
            }),
            description: Joi.string().allow('', null)
        })

        let { error } = validator.validate(userData);
        if (error) {
            return res.status(400).json({
                "message": error.details[0].message,
                error
            });
        }

        let amenities = await Amenities.findOne({ name: new RegExp(`^${userData.name}$`, "i") })
        if (amenities) {
            console.log(amenities.name.toLowerCase(), userData.name.toLowerCase());
            if (amenities?.name.toLowerCase() === userData.name.toLowerCase()) {
                return res.status(400).json({
                    message: langFunction('en', 'alreadyCreated'),
                });
            }
        }

        var newAmenities = new Amenities();
        newAmenities.name = userData.name;
        newAmenities.description = userData.description;
        newAmenities.status = userData.status || true;

        let doc = await newAmenities.save()
            return res.status(200).json({
                message: langFunction('en', 'amenityAdded'),
                "data": doc,
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  Get_Amenities_BY_Id
 * @description API Will be /api/v1/a/amenities/get/:id
 * @example Get_Amenities_BY_Id
 */

 router.get('/get/:id', async (req, res) => {
    try {
        let data = await Amenities.findOne({
            _id: req.params.id
        })
        if (data) {
            return res.status(200).json({
                message: langFunction('en', 'success'),
                "data": data,
            });
        } else {
            return res.status(400).json({
                message: langFunction('en', 'amenitiesnotfound'),
            });
        }
 } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  Amenities_Update
 * @description API Will be /api/v1/a/amenities/update/:id
 * @example Amenities_Update
 */

 router.post('/update/:id', async (req, res) => {
    try {

        let userData = req.body;
        let validator = Joi.object({
            name: Joi.string().required().messages({
                '*': `name ${langFunction("en", "feildmissing")}`
            }),
            description: Joi.string().allow('', null),
            status: Joi.boolean()
        })

        let { error } = validator.validate(userData);
        if (error) {
            return res.status(400).json({
                "message": error.details[0].message,
                error
            });
        }

        const doesAlreadyExists = await Amenities.findOne({name: new RegExp(`^${userData.name}$`, "i")});
        if(doesAlreadyExists) {
            if(doesAlreadyExists?.name.toLowerCase() === userData.name.toLowerCase()) {
                return res.status(400).json({message: langFunction("en", "nameExists")});
            }
        }

        let data = await Amenities.updateOne({
                _id: req.params.id
            } , {
                $set : {
                    name : userData.name,
                    description : userData.description,
                    status: userData.status
                }
            })
                return res.status(200).json({
                    message: langFunction('en', 'amenityUpdated'),
                    "data": data,
                });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  Get_Amenities_Pagin
 * @description API Will be /api/v1/a/amenities/pagin
 * @example Amenities_Pagin
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
            searchString: Joi.string().allow('', null),
        })

        let { error } = validator.validate(userData);
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
            sort: {'createdAt':-1}
        };
        let con = {
        }

        if (userData.searchString) {
            con['$or'] = [

                {
                    'name': new RegExp(userData.searchString, 'i')
                },
                {
                    'description': new RegExp(userData.searchString, 'i')
                },
            ]
        }


        let doc =  await Amenities.find(
            con, {},
            skipCondition
            )
        let totalCount =  await Amenities.countDocuments(con);
        return res.status(200).json({
            "result": doc,
            totalCount,
            "message": langFunction('en', 'success'),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: langFunction('en', 'servererr')
        });
    }
})


/**
 * @function  Update_Amenities_Status
 * @description API Will be /api/v1/a/amenities/update/status/:id
 * @example Update_Faqs_Status
 */

 router.post('/update/status/:id', async (req, res) => {
    try {
        let userData = req.body;

        let data = await Amenities.updateOne({
            _id: req.params.id
        } , {
            $set : {
                status : userData.status,
            }
        })
        
        if (userData.status === true) {
            return res.status(200).json({
                message: langFunction('en', 'amenityActivated'),
                "data": data,
            });
        } else {
            return res.status(200).json({
                message: langFunction('en', 'amenityDeactivated'),
                "data": data,
            });
        }
        }

    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: langFunction('en', 'servererr'),
        });
    }
})

/**
 * @function  delete
 * @description API Will be /api/v1/a/amenities/delete
 * @example delete
 */

 router.post("/delete", async (req, res) => {
    try {
      let data = await Amenities.deleteOne({_id:req.body.amId});
      return res.status(200).json({  
        message: langFunction("en", "amenityDeleted"),
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
