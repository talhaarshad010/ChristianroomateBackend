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
 * @function  add
 * @description API Will be /api/v1/c/ticket/add
 * @example add
 */

router.post("/add", async (req, res) => {
  let ticketData = req.body;
  let ticketScehma = Joi.object({
    subject: Joi.string()
      .required()
      .messages({
        "*": `subject ${langFunction("en", "feildmissing")}`,
      }),
    issue: Joi.string()
      .required()
      .messages({
        "*": `issue ${langFunction("en", "feildmissing")}`,
      }),
  });

  const {
    error
  } = ticketScehma.validate(ticketData);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      error,
    });
  }

  try {  
    let ticketno = "TKT-" + String(await Tickets.estimatedDocumentCount())
    const newTicket = Tickets({
      user: req.doc.id,
      subject: ticketData.subject,
      issue: ticketData.issue,
      status: true,
      deleted: false,
      ticketNumber:ticketno,
    });
    let ticket = await newTicket.save();
    return res.status(200).json({

      message: langFunction('en', 'ticketraised'),
      ticketno: ticket,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  getAll
 * @description API Will be /api/v1/c/tickets/getAll
 * @example getAll
 */

router.post("/getAll", async (req, res) => {
  try {
   
    const ticketData = await Tickets.find({
      user: req.doc.id,
      deleted:false,
      status:req.body.status
    }).sort({_id:-1});
    if (!ticketData) {
      return res.status(400).json({
        message: langFunction("en", "ticketnotfound"),
      });
    }
    
        return res.status(200).json({
            "result": ticketData,
            "message": langFunction('en', 'success'),
        });
  } catch (error) {
    return res.status(400).json({
      message: langFunction("en", "servererr"),
    });
  }
});

/**
 * @function  get_ticket_by_id
 * @description API Will be /api/v1/c/tickets/getTicketById
 * @example getTicketById
 */

 router.post('/getTicketById', async (req, res) => {
  try {
      let data = await Tickets.findOne({
          _id: req.body.ticketId,
      })
      if (data) {
          return res.status(200).json({
              message: langFunction('en', 'success'),
              "data": data,
          });
      } else {
          return res.status(400).json({
              message: langFunction('en', 'helpdesknotfound'),
          });
      }
  } catch (error) {
      console.error(error);
      return res.status(400).json({
          message: langFunction('en', 'servererr'),
      });
  }
})





module.exports = router;