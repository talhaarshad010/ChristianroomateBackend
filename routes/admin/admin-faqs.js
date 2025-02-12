const express = require('express');
const router = express.Router();
const Faqs = require('../../models/faqs');
const CM = require("../../common-modules/index");
const Joi = require('joi');
const csv=CM.Csv;
const langFunction = CM.Lang_Messages;
const findRemoveSync = require("find-remove");
const path = require("path");

/**
 * @function  add
 * @description API Will be /api/v1/a/faqs/add
 * @example add
 */

 router.post('/add', async (req, res) => {
    try {


        let userData = req.body;
        let validator = Joi.object({

            question: Joi.string().required().messages({
                '*': `question ${langFunction("en", "feildmissing")}`
            }),
            answer: Joi.string().required().messages({
                '*': `answer ${langFunction("en", "feildmissing")}`
            })
        })

        let { error } = validator.validate(userData);
        if (error) {
            return res.status(400).json({
                "message": error.details[0].message,
                error
            });
        }

        let faqs = await Faqs.findOne({ question: userData.question })
        if (faqs) {
            return res.status(400).json({
                message: langFunction('en', 'faqalreadycreated'),
            });
        }

        var newFaqs = new Faqs();
        newFaqs.question = userData.question;
        newFaqs.answer = userData.answer;
        newFaqs.status = userData.status || true;

        let doc = await newFaqs.save()
            return res.status(200).json({
                message: langFunction('en', 'newfaq'),
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
 * @function  Get_Faqs_BY_Id
 * @description API Will be /api/v1/a/faqs/get/:id
 * @example Get_Faqs_BY_Id
 */

 router.get('/get/:id', async (req, res) => {
    try {
        let data = await Faqs.findOne({
            _id: req.params.id
        })
        if (data) {
            return res.status(200).json({
                message: langFunction('en', 'success'),
                "data": data,
            });
        } else {
            return res.status(400).json({
                message: langFunction('en', 'faqnotfound'),
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
 * @function  Faqs_Update
 * @description API Will be /api/v1/a/faqs/update/:id
 * @example Faqs_Update
 */

 router.post('/update/:id', async (req, res) => {
    try {

        let userData = req.body;
        let validator = Joi.object({
            question: Joi.string().required().messages({
                '*': `question ${langFunction("en", "feildmissing")}`
            }),
            answer: Joi.string().required().messages({
                '*': `answer ${langFunction("en", "feildmissing")}`
            }),
          status: Joi.boolean().required().messages({
              '*': `status ${langFunction("en", "feildmissing")}`
            })
        })

        let { error } = validator.validate(userData);
        if (error) {
            return res.status(400).json({
                "message": error.details[0].message,
                error
            });
        }

        let data = await Faqs.updateOne({
                _id: req.params.id
            } , {
                $set : {
                    question : userData.question,
                    answer : userData.answer,
                    status: userData.status
                }
            })
                return res.status(200).json({
                    message: langFunction('en', 'dataupdated'),
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
 * @function  delete
 * @description API Will be /api/v1/a/faqs/delete
 * @example delete
 */

 router.post("/delete", async (req, res) => {
    try {

      const test = await Faqs.findOne({
            _id: req.body.id,
            });
            if(!test){
              return res.status(400).json({
                message: "Faqs not found",
                });
            }
            let data = await Faqs.updateOne(
                    { _id: req.body.id},
                    {
                      $set: {
                        deleted: true,
                      },
                    }
                  );
      return res.status(200).json({
        message: "FAQ has been deleted successfully.",
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
 * @function  Get_Faqs_Pagin
 * @description API Will be /api/v1/a/faqs/pagin
 * @example Faqs_Pagin
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
            deleted:false,
        }

        if (userData.searchString) {
            con['$or'] = [

                {
                    'question': new RegExp(userData.searchString, 'i')
                },
                {
                    'answer': new RegExp(userData.searchString, 'i')
                },
            ]
        }

        let doc =  await Faqs.find(
            con, {},
            skipCondition
            )
        let totalCount =  await Faqs.countDocuments(con);
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
 * @function  Update_Faqs_Status
 * @description API Will be /api/v1/a/faqs/update/status/:id
 * @example Update_Faqs_Status
 */

 router.post('/update/status/:id', async (req, res) => {
    try {
        let faqsData = req.body;

        let data = await Faqs.updateOne({
            _id: req.params.id
        } , {
            $set : {
                status : faqsData.status,
            }
        })
            return res.status(200).json({
                message: langFunction('en', 'faqUpdated'),
                "data": data,
            });
        }

    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: langFunction('en', 'servererr'),
        });
    }
})


/**
 * @function  export
 * @description API Will be /api/v1/a/faqs/export
 * @example exportCSV
 */

 router.get('/export', async (req, res) => {
    try {

        let doc =  await Faqs.find({})
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
        return res.status(500).json({
            message: langFunction('en', 'servererr')
        });
    }
})



module.exports = router;
