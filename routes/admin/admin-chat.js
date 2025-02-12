const express = require("express");
const router = express.Router();
const Chat = require("../../models/helpdeskChat");
const config = require("../../common-modules/config");
const CMS = require("../../common-modules/index");
const langFunction = CMS.Lang_Messages;
const Tickets = require("../../models/tickets");
const Joi = require('joi');


async function getTotalDays(createdAt, resolvedAt) {
    let diffDays = parseInt((resolvedAt - createdAt) / (1000 * 60 * 60 * 24)); //gives day difference
    return diffDays
}


/**
 * @function  add
 * @description API Will be /api/v1/a/chat/add
 * @example add
 */

router.post('/add', async (req, res) => {
    let userData = req.body;
    let id = req.body.ticketId


    let helpdesk = await Tickets.findOne({ _id: id }).populate('user')

    if (helpdesk) {
        let updateTicket = await Tickets.updateOne({ _id: id }, { $set: { isRead: true } })
        let newAnswerss = new Chat();
        //newAnswerss.helpdeskId = id;
        if(userData.response){
        newAnswerss.response = userData.response;
        }
        newAnswerss.ticketId=id;
        newAnswerss.adminId = req.doc.id;
        if(userData.image){
            newAnswerss.image=userData.image;
        }
        let doc = await newAnswerss.save()


        // notificationData = {
        //     title: 'Reply from Christian!',
        //     description: langFunction('en', 'ticketReply') + helpdesk.ticketNumber,
        //     userId: helpdesk.userId._id,

        // }
        // await CMS.Notification.createNotification(notificationData)

        // if (helpdesk.userId.deviceToken) {
        //     let pushNotificationData = {
        //         title: "Reply from Christian!",
        //         body: langFunction('en', 'ticketReply') + helpdesk.ticketNumber,
        //         data: {
        //             orderId: id,
        //             type: "Reply from Christian!"
        //         },
        //         deviceToken: helpdesk.userId.deviceToken
        //     }
        //     await CMS.Push_Notification.createPushNotification(pushNotificationData)
        // }


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
 * @function  Update_Helpdesk_Status
 * @description API Will be /api/v1/a/chat/status/:ticketId
 * @example Update_Helpdesk_Status
 */

router.post('/status', async (req, res) => {
    try {
        let body = req.body;
        let currentDate = new Date()
        let data = await Tickets.findOne({
            _id: req.body.ticketId
        })
        if (data) {
            let totalDays = await getTotalDays(data.createdAt, currentDate)
            console.log(totalDays)
            data.status = body.status;
            data.requestResolvedOn = currentDate
            data.issueDuration = totalDays
            let doc = await data.save()
            res.status(200).json({
                message: langFunction('en', 'dataupdated'),
                "data": doc,
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


/**
 * @function  Get_Helpdesk_Pagin
 * @description API Will be /api/v1/a/chat/pagin
 * @example Get_Helpdesk_Pagin
 */

router.post('/pagin', async (req, res) => {
    try {
        let helpdeskData = req.body;

        let validator = Joi.object({
            page: Joi.number().required().messages({
                '*': `page ${langFunction("en", "feildmissing")}`
            }),
            perPage: Joi.number().required().messages({
                '*': `perPage ${langFunction("en", "feildmissing")}`
            }),
            searchString: Joi.string().allow('', null),
            status: Joi.boolean().allow('', null)
        })

        let { error } = validator.validate(helpdeskData);
        if (error) {
            return res.status(400).json({
                "message": error.details[0].message,
                error
            });
        }

        let startIndex = ((helpdeskData.page - 1) * helpdeskData.perPage);
        let perPage = parseInt(helpdeskData.perPage);
        skipCondition = {
            skip: startIndex,
            limit: perPage,
            sort: { 'createdAt': -1 }
        };
        let con = {
        }

        if (helpdeskData.searchString) {

            con['$or'] = [
                {
                    'ticketNumber': new RegExp(helpdeskData.searchString, 'i')
                },
                {

                    'subject': new RegExp(helpdeskData.searchString, 'i')
                },
                {

                    'issue': new RegExp(helpdeskData.searchString, 'i')
                }
            ]
        }

        con.status = helpdeskData.status;

        let doc = await Tickets.find(
            con,
            {},
            skipCondition
        ).populate([{
            path: 'user',
            select: { '_id': 1, 'image': 1,'username':1 },
            populate: {
                path: 'image',
            }
        }
    ])

        let totalCount = await Tickets.countDocuments(con);
        return res.status(200).json({
            "result": doc,
            totalCount,
            "message": langFunction('en', 'success'),
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message: langFunction('en', 'servererr')
        });
    }
})


/**
 * @function  Get_ReplytoTicket
 * @description API Will be /api/v1/a/chat/getAllReplytoTicket
 * @example Get_ReplytoTicket
*/

router.post('/getAllReplytoTicket', async (req, res) => {
    let replyTicket = await Chat.find({ ticketId: req.body.ticketId })
        .populate(['image',{
            path: 'userId',
            select: { '_id': 1, 'image': 1, 'name':1 },
            populate: {
                path: 'image',
            },
        },{
            path: 'adminId',
            select: { '_id': 1, 'userImage': 1,'name':1 },
            populate: {
                path: 'userImage',
            }
        }])
    if (replyTicket) {
        return res.status(200).json({
            message: langFunction('en', 'success'),
            "data": replyTicket,
        });
    } else {
        return res.status(400).json({
            message: langFunction('en', 'replyTicketnotfound'),
        });
    }
});

/**
 * @function  Get_Helpdesk_BY_Id
 * @description API Will be /api/v1/a/chat/ticket/
 * @example Get_Helpdesk_BY_Id
 */

router.post('/ticket', async (req, res) => {
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
