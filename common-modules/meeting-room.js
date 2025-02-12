const axios = require("axios");

if (!process.env.DAILY_API_AUTH) {
    throw new Error('DAILY_API_AUTH IS MISSING FROM ENV')
}
const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.DAILY_API_AUTH,
};
 async function createNewRooms(room)  {
    const resp = await axios.post("https://api.daily.co/v1/rooms", {
        name: room.name,
        privacy:room.privacy,
        properties: room.properties           
    },
        { headers: headers },
    )
    return resp.data
      
};


module.exports = {
    createNewRooms

};
