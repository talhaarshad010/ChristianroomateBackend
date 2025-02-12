const express = require("express");
const router = express.Router();
const Tickets = require("../../models/tickets");
const config = require("../../common-modules/config");
const CM = require("../../common-modules/index");
const langFunction = CM.Lang_Messages;
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


/**
 * @function  update
 * @description API Will be /api/v1/a/ticket/update
 * @example update
 */

router.post("/update", async (req, res) => {
  let ticketData = req.body;
  try {
    const ticket = await Tickets.findOne({
      _id: ticketData.ticketid,
      });
      if(!ticket){
        return res.status(400).json({
          message: "Ticket not found",
          });
      }

      let data = await Tickets.updateOne(
              { _id: ticketData.ticketid},
              {
                $set: {
                  status: ticketData.status,
                },
              }
            );
  if (ticketData.status === true) {
    return res.status(200).json({
      message: langFunction("en", "tickedOpened"),
      data: data,
    });
  } else {
    return res.status(200).json({
      message: langFunction("en", "tickedClosed"),
      data: data,
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
 * @function  getActiveTickets
 * @description API Will be /api/v1/a/tickets/getActiveTickets
 * @example getActiveTickets
 */

router.post("/getActiveTickets", async (req, res) => {
  const userdata = req.body;
  try {
    const ticketData = await Tickets.find({
      status: userdata.status
    },{}).sort({_id:-1});
    if (!ticketData) {
      return res.status(400).json({
        message: langFunction("en", "ticketnotfound"),
      });
    }
    return res.status(200).json({
      data: ticketData,
    });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});




module.exports = router;
