const express = require("express");
const router = express.Router();
const Bookmark = require("../../models/bookmark");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;


/**
 * @function  getByUserId
 * @description API Will be /api/v1/a/bookmark/getByUserId
 * @example getByUserId
 */

router.post("/getByUserId", async (req, res) => {
  try {

    let bookmark = await Bookmark.find({
      user: req.body.user
    }).populate({path: "property", populate: [{path: "images user"}]})
      .populate({path: "tenant", populate: [{path: "user", populate: [{path: "image"}]}]})
      .populate("user")
      // .populate("property tenant user");
    if(!bookmark){
      return res.status(400).json({
        message:"No Data",
      });
    }
    return res.status(200).json({
      result: bookmark,
      message: langFunction("en", "success"),
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});




module.exports = router;
