const FCM = require('fcm-push');
const fcm = new FCM(process.env.FCM_KEY);

module.exports = {
    
    createPushNotification : async function (data) {
        try{

            var message = {
                to: data.deviceToken, // required fill with device token or topics
                collapse_key: 'your_collapse_key', 
                data: data.data,
                notification: {
                    title: data.title,
                    body: data.body
                }
            };

            let response  = await fcm.send(message);
            console.log("Push Notification SEND .." , response  , data.deviceToken)
            return response; 
        
        }catch(err){
            console.log("Push Notification SEND .." , data.deviceToken)
            console.log(err)
            // throw err;
        }
    }

}