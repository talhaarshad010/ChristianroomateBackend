const express = require("express");
const router = express.Router();
const Bookmark = require("../../models/bookmark");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;


/**
 * @function  add
 * @description API Will be /api/v1/c/bookmark/add
 * @example add
 */

router.post("/add", async (req, res) => {
  let bookmarkData = req.body;
  try {    
    if(req.body.status){
      const newBookmark = Bookmark({
        user: req.doc.id,
        property: req.body.propertyId,
        status: req.body.status,
        deleted: false,
        bookId:req.body.bookId,
        tenant:req.body.tenantId,
        type:req.body.type
      });
    let bookmark= await newBookmark.save();
      return res.status(200).json({
        message: langFunction("en", "success"),
        data: bookmark,
      });
    }else{
      let bookmark=await Bookmark.deleteOne(
        { _id: req.body.bookId});
        return res.status(200).json({
          message: langFunction("en", "success"),
          data: bookmark,
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getUserBookmark
 * @description API Will be /api/v1/c/bookmark/getByUserId
 * @example getUserBookmark
 */
router.post("/getByUserId", async (req, res) => {
  try {
    console.log(req.body.type);
    if(req.body.type==0){
      let bookmark = await Bookmark.find({
        user: req.doc.id,type:0
      }).populate(["user",{
        path: 'user',
        populate:{
          path:'image'
        }
      }]).populate(["property",{path:'property',populate:{path:'images user'}},{path:'property',populate:{path:'amenties'}}]);
      
      if(!bookmark){
        return res.status(400).json({
          message:"No Data",
        });
      }
      return res.status(200).json({
        result: bookmark,
        message: langFunction("en", "success"),
      });
      
    }else{
      let bookmark = await Bookmark.find({
        user: req.doc.id,type:1
      }).populate(["user",{
        path: 'user',
        populate:{
          path:'image'
        }
      }]).populate(["tenant",{path:'tenant',populate:{path:'user',populate:{path:'image'}}}]);
      
      if(!bookmark){
        return res.status(400).json({
          message:"No Data",
        });
      }
      return res.status(200).json({
        result: bookmark,
        message: langFunction("en", "success"),
      });
      
    }
    
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});


module.exports = router;