const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const serverr = require("http").Server(app);
const Customer = require("./models/customer");
const { ObjectId } = require("mongodb"); // or ObjectID
const Chat = require("./models/customer_chat");
const fs = require("fs"); // Or `import fs from "fs";` with ESM

// require("dotenv").config({
//   path: path.join(__dirname) + `/.env.${process.env.NODE_ENV}`,
// });

require("dotenv").config();

// if (!fs.existsSync(path.join(__dirname,"./uploads"))) {
//   fs.mkdirSync(path.join(__dirname,"./uploads"))
// }

const io = require("socket.io")(serverr, {
  cors: {
    origin: "*", // TODO: Change this when deploying to production
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

app.get("/test", function (req, res) {
  console.log("<<<<>>>>>");
  res.sendFile(__dirname + "/test.html");
});

app.get("/", function (req, res) {
  res.send("App is running.");
});

app.get("/abc", function (req, res) {
  console.log("<<<<>>>>>");
  res.sendFile(__dirname + "/abc.html");
});

/******* Chat functions start here **********/
var sockets = []; // store socket id
io.sockets.on("connection", function (socket) {
  console.log("connection build...");
  /***** create socket id ********/
  socket.on("join", function (data) {
    console.log("join req:: ", data);
    sockets[data.user_id] = socket.id;
    console.log("check socket", data?.user_id, " ... ", socket.id);
  });
  /**** Save chat messages and media files  *******/
  socket.on("send_message", async (data) => {
    console.log("New Incoimg parameters request +++++++++++++", data);
    let socket_receiver = sockets[data.receiverId];
    let chatObj = {
      senderId: data.user_id,
      receiverId: data.receiverId,
      msgType: data.msgType,
      msgRead: "0",
    };

    if (data.image) {
      chatObj.image = data.image;
    }
    if (data.message.trim()) {
      chatObj.message = data.message.trim();
    }
    var chat_data = new Chat(chatObj);
    var saved = await chat_data.save();
    console.log("chat saved:: ", saved);
    console.log("receiver_sock:: ", socket_receiver);
    var d = { message: data.message, senderId: data.user_id };
    console.log("send message:: ", d);
    var user = await Customer.findOne({ _id: ObjectId(data.user_id) })
      .select("_id name username status image createdAt")
      .lean();
    io.to(socket_receiver).emit("receiver_message", {
      message: data.message,
      image: data.image,
      senderId: user,
    }); //receiver socket

    // if(data.msgType == 'text') {
    //     var chat_data = new Chat({ senderId: data.user_id, receiverId : data.receiverId, message:data.message.trim(), image: , msgType: data.msgType, msgRead: '0' });
    //     var saved = await chat_data.save();
    //     console.log("chat saved:: ", saved);
    //     console.log("receiver_sock:: ", socket_receiver);
    //     var d = { message:data.message, senderId: data.user_id};
    //     console.log("send message:: ", d );
    //     var user =  await Customer.findOne({ _id : ObjectId(data.user_id) }).select('_id name username status image createdAt').lean();
    //     io.to(socket_receiver).emit('receiver_message', { message:data.message, senderId: user }); //receiver socket
    // }else if (data.msgType === "image") {
    //     let chat_data = new Chat({senderId: data.user_id, receiverId: data.receiverId, image: data.image, msgType: data.msgType, msgRead: 0});
    //     await chat_data.save();
    //     io.to(socket_receiver).emit('receiver_message', {image: data.image, senderId: user}); //receiver socket
    // }
  });
  /**** get recent chat listing ******/
  socket.on("get_recentChat", async (data) => {
    console.log("recent chat list:: ", data);

    var socketID = sockets[data.user_id];
    //get user profile
    var user = await Customer.find({ _id: ObjectId(data.user_id) })
      .select("_id name username status image createdAt")
      .lean();

    //get users list
    var recent_chat_users = await Chat.find({
      $and: [
        {
          receiverId: ObjectId(data.user_id),
          senderId: { $ne: ObjectId(data.user_id) },
        },
      ],
    })
      .distinct("senderId")
      .lean();

    var recent_chat_users2 = await Chat.find({
      $and: [
        {
          senderId: ObjectId(data.user_id),
          receiverId: { $ne: ObjectId(data.user_id) },
        },
      ],
    })
      .distinct("receiverId")
      .lean();

    recent_chat_users = [...recent_chat_users, ...recent_chat_users2];
    const set = new Set();
    for (let recentChatUser of recent_chat_users) {
      set.add(recentChatUser.toString());
    }
    recent_chat_users = Array.from(set);

    //get recent chat users last chat
    var c = 1;
    var arr = [];
    for (var i = 0; i < recent_chat_users.length; i++) {
      console.log("user >>> " + i + "-----------", recent_chat_users[i]);
      var recent_user = await Customer.findOne({ _id: recent_chat_users[i] })
        .populate({ path: "image", select: "name path" })
        .select("_id username name image");
      console.log("recent_chat >>> " + i + "-----------", recent_user);
      var recent_chat = await Chat.findOne({
        $or: [
          {
            senderId: ObjectId(recent_chat_users[i]),
            receiverId: { $eq: ObjectId(data.user_id) },
          },
          {
            receiverId: ObjectId(recent_chat_users[i]),
            senderId: { $eq: ObjectId(data.user_id) },
          },
        ],
      })
        .populate({ path: "image", select: "path" })
        .sort({ createdAt: -1 })
        .limit(1);
      console.log("recent_chat >>> " + i + "-----------", recent_chat);
      if (recent_chat != null && recent_user != null) {
        var t = {
          user_id: recent_user._id,
          username: recent_user.username,
          picture: recent_user.image,
          lastchat: recent_chat.message,
          latest_timestamp: recent_chat.createdAt,
          image: recent_chat.image,
        };
        arr.push(t);
      }

      if (c == recent_chat_users.length) {
        user.previousChat = arr;
        console.log("recent_chat user  :: ", user);
        arr.sort((a, b) => {
          return b.latest_timestamp - a.latest_timestamp;
        });
        console.log("Here: ->", arr);
        io.to(socketID).emit("recentChatListing", arr);
      }
      c++;
    }
  });

  /* Get single chat
   * Params: user_id, receiverId
   */

  socket.on("getSingleChat", async (data) => {
    console.log("single chat hit::", data);
    var socketID = sockets[data.user_id];
    var arr = [];
    console.log("here is the socket ID ?????????", socketID);
    //get user profile
    var user = await Customer.find({ _id: ObjectId(data.user_id) })
      .select("_id name status image createdAt")
      .lean();
    //get chat list
    var single_chat = await Chat.find({
      $or: [
        {
          senderId: ObjectId(data.receiverId),
          receiverId: { $eq: ObjectId(data.user_id) },
        },
        {
          receiverId: ObjectId(data.receiverId),
          senderId: { $eq: ObjectId(data.user_id) },
        },
      ],
    })
      .populate({
        path: "senderId",
        populate: [{ path: "image", select: "name path" }],
        select: "username",
      })
      .populate({ path: "image", select: "name path" })
      .select("message createdAt image")
      .sort({ createdAt: 1 });
    // single_chat.image = single_chat.image.toString();
    console.log("Single chat:: ", single_chat);
    user.previousChat = single_chat;
    console.log("Single chat:: ", user);
    io.to(socketID).emit("SingleChat_data", single_chat);
  });
});

if (!process.env.MONGO_URI) {
  throw new Error("MONGO URI IS MISSING FROM ENV ");
}
const connection = mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
    // useCreateIndex: true
  })
  .then(() => console.log("Connected to database..."))
  .catch((err) => console.log("Cannot connect to database!!"));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));
// app.use(express.static(__dirname, "/uploads"));

app.use("/api/v1/a", require("./routes/admin"));
app.use("/api/v1/c", require("./routes/customer"));

// app.use("/uploads", express.static('uploads'));
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader(
        "Access-Control-Allow-Origin",
        "https://christianroommates.net/"
      );
    },
  })
);
// app.use("/api/v1/notifications", require("./createNotification"));

// Routes of Admin, User

if (process.env.MODE == "DEVELOPMENT") {
  app.use((req, res, next) => {
    console.log("===== Header  ====");
    console.log("URL : " + req.method + " -> " + req.url);
    console.log("X-Request-ID : " + req.headers["x-request-id"]);
    // console.log(req.headers['X-Request-ID']);
    console.log("===== Query  ====");
    console.log(req.query);
    console.log("===== Params  ====");
    console.log(req.params);
    console.log("===== body  ====");
    // console.log(req.body);
    next();
  });
}

app.get("/health", (req, res) => {
  let git = require("git-rev-sync");
  let pjson = require("./package.json");
  console.log(git);
  res.status(200).json({
    project: pjson.name,
    running: true,
    version: pjson.version,
    branch: git.branch(),
    head: git.short(),
    "head-long": git.long(),
    date: git.date(),
    repoName: git.remoteUrl().split("/")[4].split(".")[0],
    mode: process.env.MODE,
  });
});

app.get("/version", (req, res) => {
  let pjson = require("./package.json");
  res.status(200).json({
    project: "ER-JUL-22",
    running: true,
    version: "ER-JUL-22",
    mode: process.env.MODE,
  });
});

serverr.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);

console.log(process.env.PORT + " is the magic port");
