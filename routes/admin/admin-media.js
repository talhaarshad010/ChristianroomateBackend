const express = require('express');
const router = express.Router();
const CMS = require("../../common-modules/index");
let multer = require('multer');
const Image = require('../../models/images');
const Rundfunc = require('../../common-modules/config')

// const Image = require('../../uploads');

// const upload = multer()
const multerOption = {
    // dest: 
    storage:multer.diskStorage({
        destination: function(req, file, cb){
            cb(null, "uploads")
        },
        filename:function(req, file, cb){
            cb(null, Rundfunc.randName()+"-"+file.originalname)
        }
    })
     }
const upload = multer(process.env.UPLOAD_MODE === 'local' ? multerOption : {})


/**
 * @function  Upload_File_Admin
 * @description API Will be /api/v1/a/media/upload
 * @example Upload_File
 */

router.post('/upload',upload.single('coverImage'), async (req, res) => {
    try {
        let uploadData = req.file;
        console.log(uploadData)
        let doc;
        if(process.env.UPLOAD_MODE === 'local'){
            doc = await CMS.Media_Center.uploadMediaFiles(uploadData)
        }else{
            doc = await CMS.Media_Center.uploadMediaFilesS3(uploadData)
        }
        return res.status(200).json({
            message: CMS.Lang_Messages("en", 'uploaded'),
            "data": doc
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: CMS.Lang_Messages('en', 'servererr'),
            error:error
        });
    }
})



/**
 * @function  Download_File_Admin
 * @description API Will be /api/v1/a/media/download-file/:imageId
 * @example Download_File
 *
 */

router.get('/download-file/:imageId', async function (req, res) {
    try {
        let imageId = req.params.imageId;
        let image= await CMS.Media_Center.getImage(imageId)
        if(image){
        console.log(image);
        let result = await CMS.Media_Center.downloadFileFromS3(image.path);
        //  console.log("Response data", result);
        return res.status(200).json({
            message: CMS.Lang_Messages('en', 'downloaded'),
            "data": result,
            "file":image.name
        });

    } else{
        return res.status(200).json({
            message: CMS.Lang_Messages('en', 'notfound'),
        });

    }

    } catch (error) {
        console.error(error.message);
        return res.status(400).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})


/**
 * @function  Get_FileName_Admin
 * @description API Will be /api/v1/a/media/getFile/:imageId
 * @example Download_File
 *
 */

 router.get('/getFile/:imageId', async function (req, res) {
    try {
        let imageId = req.params.imageId;
        let image= await CMS.Media_Center.getImage(imageId)
        if(image){
        console.log(image);

        return res.status(200).json({
            message: CMS.Lang_Messages('en', 'success'),
            "data": image
        });

    } else{
        return res.status(200).json({
            message: CMS.Lang_Messages('en', 'notfound'),
        });

    }

    } catch (error) {
        console.error(error.message);
        return res.status(400).json({
            message: CMS.Lang_Messages('en', 'servererr'),
        });
    }
})


// /**
//  * @function  Delete_File_Admin
//  * @description API Will be /api/v1/a/media/deleteFile/:imageId
//  * @example Delete_File_Admin
//  *
//  */

// router.get('/deleteFile/:imageId', async function (req, res) {
//     try {
//         let imageId = req.params.imageId;
//         let imageData = await Image.findOne({_id:imageId})
//         if(!imageData){
//             return res.status(400).json({
//                 message: CMS.Lang_Messages('en', 'notfound'),
//             });
//         }
//         let image= await CMS.Media_Center.deleteFileFromS3(imageData.path,imageId)
//         if(image){
//             console.log(image);

//             return res.status(200).json({
//                 message: CMS.Lang_Messages('en', 'success'),
//                 "data": image.name
//             });
//         } else{
//             return res.status(200).json({
//                 message: CMS.Lang_Messages('en', 'notfound'),
//             });
//         }

//     } catch (error) {
//         console.error(error.message);
//         return res.status(400).json({
//             message: CMS.Lang_Messages('en', 'servererr'),
//         });
//     }
// })



module.exports = router;
