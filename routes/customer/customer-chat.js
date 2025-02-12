const express = require("express");
const router = express.Router();
const Chat = require("../../models/helpdeskChat");
const config = require("../../common-modules/config");
const CMS = require("../../common-modules/index");
const langFunction = CMS.Lang_Messages;
const Tickets = require("../../models/tickets");

/**
 * @function  ReplytoTicket
 * @description API Will be /api/v1/c/chat/add
 * @example ReplytoTicket
 */

 router.post('/add', async (req, res) => {
  let userData = req.body;

  let array1 = ['ticketId']
  for (let index = 0; index < array1.length; index++) {
      const element = array1[index];
      if (!userData[element]) {
          return res.status(400).json({
              "message": element + langFunction('en', 'feildmissing'),
          });
      }
  }

  let ticket = await Tickets.findOne({ _id: userData.ticketId })
  if (ticket) {
      let chat = new Chat();
      chat.ticketId = userData.ticketId;
      chat.userId = req.doc.id;
      if (userData.response) {
        chat.response = userData.response;
      }
      if (userData.image) {
        chat.image = userData.image;
      }
      let doc = await chat.save()

      return res.status(200).json({
          message: langFunction('en', 'replyticket'),
          "data": doc,
      });
  } else {
      return res.status(400).json({
          message: langFunction('en', 'helpdesknotfound'),
      });
  }
});


/**
* @function  Get_ReplytoTicket
* @description API Will be /api/v1/u/chat/getReplytoTicket
* @example Get_ReplytoTicket
*/

router.post('/getReplytoTicket', async (req, res) => {

  let chat = await Chat.find({ ticketId: req.body.ticketId })
      .populate(['image', {
          path: 'userId',
          select: { '_id': 1, 'image': 1,'name':1  },
          populate: {
              path: 'image',
          },
      }, {
              path: 'adminId',
              select: { '_id': 1, 'userImage': 1,'name':1 },
              populate: {
                  path: 'userImage',
              }
          }


      ])

  if (chat) {
      return res.status(200).json({
          message: langFunction('en', 'success'),
          "data": chat,
      });
  } else {
      return res.status(400).json({
          message: langFunction('en', 'replyTicketnotfound'),
      });
  }
});




module.exports = router;