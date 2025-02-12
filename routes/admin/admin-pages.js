const express = require('express');
const router = express.Router();
const Pages = require('../../models/pages');
const CMS = require("../../common-modules/index");




langFunction = CMS.Lang_Messages

/**
 * @function  Get_PAGE
 * @description API Will be /api/v1/a/pages/:pagePath
 */

router.get('/:pagePath', async (req, res) => {

    let currentLanguage = req.lang;
    let currentPagePath = req.params.pagePath;
    try {

        let data = await Pages.findOne({ pagePath: currentPagePath, language: currentLanguage })
        res.status(200).json({
            message: CMS.Lang_Messages('en', 'success'),
            "data": data,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})

/**
 * @function  UPDATE_PAGE
 * @description API Will be /api/v1/a/pages/updatePage/:pagePath
 */


router.post('/updatePage/:pagePath', async (req, res) => {
    let currentLanguage = req.lang;
    let currentPagePath = req.params.pagePath;
    let pageData = req.body;
    try {

        let fields = ['section', "pageName"]
        for (let index = 0; index < fields.length; index++) {
            const element = fields[index];
            if (!pageData[element]) {
                return res.status(400).json({
                    "message": element + langFunction('en', 'feildmissing'),
                });
            }
        }

        const query = {
            pagePath: currentPagePath,
            language: currentLanguage
        }
        const update = {
            section: pageData.section,
            language: currentLanguage,
            pagePath: currentPagePath,
            pageName: pageData.pageName
        }
        const option = {
            upsert: true
        }

        const data = await Pages.updateOne(query, update, option)
        return res.status(200).json({
            message: langFunction('en', 'updatedPage'),
            "data": data,
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr'),
        });
    }
})

/**
 * @function  Pages_Pagin
 * @description API Will be /api/v1/a/pages/pagin
 */
router.post('/pagin', async (req, res) => {
    let currentLanguage = req.lang;

    try {
        let pageData = req.body;

        let array1 = ['page', 'perPage']
        for (let index = 0; index < array1.length; index++) {
            const element = array1[index];
            if (!pageData[element]) {
                return res.status(400).json({
                    "message": element + langFunction('en', 'feildmissing'),
                });
            }
        }
        let startIndex = ((pageData.page - 1) * pageData.perPage);
        let perPage = parseInt(pageData.perPage);
        skipCondition = {
            skip: startIndex,
            limit: perPage,
            sort: { 'createdAt': -1 }
        };
        let con = {
            language: currentLanguage
        }

        if (pageData.searchString) {
          
            con['$or'] = [
                {
                    'pageName': new RegExp(pageData.searchString, 'i'),
                    // 'pagePath': new RegExp(pageData.searchString, 'i')

                },

            ]
        }
        console.log(con)

        let doc = await Pages.find(
            con, {},
            skipCondition
        )
        let totalCount = await Pages.countDocuments(con);
        console.log( "Admin-Page - Total Count ..." ,totalCount)
        res.status(200).json({
            "result": doc,
            totalCount,
            "message": langFunction('en', 'success'),
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: langFunction('en', 'servererr')
        });
    }
})


module.exports = router;