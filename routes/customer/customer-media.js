// const express = require("express");
// const router = express.Router();
// const CMS = require("../../common-modules/index");
// let multer = require("multer");
// const Image = require("../../models/images");
// const Rundfunc = require("../../common-modules/config");
// const cors = require("cors");
// // const upload = multer();
// /**
//  * @function  Upload_File_Customer
//  * @description API Will be /api/v1/c/media/upload
//  * @example Upload_File
//  */

// const multerOption = {
//   // dest:
//   storage: multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "uploads");
//     },
//     filename: function (req, file, cb) {
//       cb(null, Rundfunc.randName() + "-" + file.originalname);
//     },
//   }),
// };
// const upload = multer();

// router.post("/upload", upload.single("coverImage"), async (req, res) => {
//   try {
//     let uploadData = req.file;
//     console.log("DAAATATATATATATATA", uploadData);
//     // let doc = await CMS.Media_Center.uploadMediaFiles(uploadData);
//     let doc;
//     // if (process.env.UPLOAD_MODE === "local") {
//     //   doc = await CMS.Media_Center.uploadMediaFiles(uploadData);
//     // } else {
//     doc = await CMS.Media_Center.uploadMediaFilesS3(uploadData);
//     // }
//     return res.status(200).json({
//       message: CMS.Lang_Messages("en", "uploaded"),
//       data: doc,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({
//       message: CMS.Lang_Messages("en", "servererr"),
//       error: error,
//     });
//   }
// });
// router.get("/download-file/:imageId", async function (req, res) {
//   try {
//     let imageId = req.params.imageId;
//     let image = await CMS.Media_Center.getImage(imageId);
//     if (image) {
//       console.log(image);
//       let result = await CMS.Media_Center.downloadFileFromS3(image.path);
//       //  console.log("Response data", result);
//       return res.status(200).json({
//         message: CMS.Lang_Messages("en", "downloaded"),
//         data: result,
//         file: image.name,
//       });
//     } else {
//       return res.status(200).json({
//         message: CMS.Lang_Messages("en", "notfound"),
//       });
//     }
//   } catch (error) {
//     console.error(error.message);
//     return res.status(400).json({
//       message: CMS.Lang_Messages("en", "servererr"),
//     });
//   }
// });
// /**
//  * @function  Download_File_User
//  * @description API Will be /api/v1/u/download/fileurl/:imageId
//  * @example Download_File_User
//  *
//  */

// router.get("/fileurl/:imageId", async function (req, res) {
//   router.use(cors());
//   let currentLanguage = req.lang;
//   try {
//     let imageId = req.params.imageId;
//     let image = await CMS.Media_Center.getImage(imageId);
//     if (image) {
//       let url = await CMS.Media_Center.getImageUrl(imageId);
//       console.log("Response data", url);
//       return res.status(200).json({
//         message: CMS.Lang_Messages("en", "downloaded"),
//         data: image.path,
//       });
//     } else {
//       return res.status(200).json({
//         message: CMS.Lang_Messages("en", "notfound"),
//       });
//     }

//     // return res.send(result.Body)
//   } catch (error) {
//     console.error(error.message);
//     return res.status(400).json({
//       message: CMS.Lang_Messages("en", "servererr"),
//     });
//   }
// });
// module.exports = router;

const express = require("express");
const router = express.Router();
const CMS = require("../../common-modules/index");
const multer = require("multer");
const Rundfunc = require("../../common-modules/config");
const cors = require("cors");
const Image = require("../../models/images");

// Set up CORS for all routes
router.use(
  cors({
    origin: "*", // Allows all domains (you can specify your domain in production)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["*"], // Allowed headers
    exposedHeaders: ["ETag"], // Exposed headers
    credentials: true, // Allow credentials (cookies, auth tokens, etc.)
  })
);

/**
 * @function Upload_File_Customer
 * @description API Will be /api/v1/c/media/upload
 * @example Upload_File
 */

const multerOptions = {
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, Rundfunc.randName() + "-" + file.originalname);
    },
  }),
};

const upload = multer(multerOptions);

// Upload Route
router.post("/upload", upload.single("coverImage"), async (req, res) => {
  try {
    const uploadData = req.file;
    console.log("is receiving:", uploadData);

    if (!uploadData) {
      return res.status(400).json({
        message: CMS.Lang_Messages("en", "noFileUploaded"),
      });
    }

    console.log("Uploaded Data:", uploadData);
    const doc = await CMS.Media_Center.uploadMediaFilesS3(uploadData);

    return res.status(200).json({
      message: CMS.Lang_Messages("en", "uploaded"),
      data: doc,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    return res.status(500).json({
      message: CMS.Lang_Messages("en", "servererr"),
      error: "sdsdsd" + error.message,
    });
  }
});

// Download File Route
router.get("/download-file/:imageId", async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const image = await CMS.Media_Center.getImage(imageId);

    if (!image) {
      return res.status(404).json({
        message: CMS.Lang_Messages("en", "notfound"),
      });
    }

    const result = await CMS.Media_Center.downloadFileFromS3(image.path);
    return res.status(200).json({
      message: CMS.Lang_Messages("en", "downloaded"),
      data: result,
      file: image.name,
    });
  } catch (error) {
    console.error("Download error:", error.message);
    return res.status(500).json({
      message: CMS.Lang_Messages("en", "servererr"),
      error: error.message,
    });
  }
});

// Get File URL Route
router.get("/fileurl/:imageId", async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const image = await CMS.Media_Center.getImage(imageId);

    if (!image) {
      return res.status(404).json({
        message: CMS.Lang_Messages("en", "notfound"),
      });
    }

    const url = await CMS.Media_Center.getImageUrl(imageId);
    return res.status(200).json({
      message: CMS.Lang_Messages("en", "downloaded"),
      data: url,
    });
  } catch (error) {
    console.error("Get URL error:", error.message);
    return res.status(500).json({
      message: CMS.Lang_Messages("en", "servererr"),
      error: error.message,
    });
  }
});

module.exports = router;
