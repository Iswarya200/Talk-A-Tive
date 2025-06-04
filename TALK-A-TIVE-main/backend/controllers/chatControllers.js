const asyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  //we need user id with which we will create chats
  const { userId } = req.body;
  //if chat with this userId exists return it,if it doesnt create one

  if (!userId) {
    console.log("UserId param not sent with request"); // if it is invalid throws an error
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    //we are looking for a chat such that
    isGroupChat: false, //its not a groupchat(this is checked through chatModel that we imported)
    $and: [
      //both the things have to be satisfied
      { users: { $elemMatch: { $eq: req.user._id } } }, //it should be equal to currenty userid
      { users: { $elemMatch: { $eq: userId } } }, //and userId should match with the user that we are looking for
    ],
  })
    .populate("users", "-password") //when we found the chat return all the info except password
    .populate("latestMessage"); //showingg latest message
  //  populate function helps you to automatically replace the specified paths in the document with document(s) from other collection(s).
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    //if chat exists
    res.send(isChat[0]); //only one chat existsbetween these two users so first index
  } else {
    ///else we should create a chat and for that we are giving data
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  //we will look for all the database for which this particular user is part of
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users); //req.body.users is a array we cannot send it directly so we have to stringify it using parsing

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user); //that group should include me

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body; //from req.body we need chat id and name

  const updatedChat = await Chat.findByIdAndUpdate(
    //we will search for the chat using id and rename it
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true, //without this ,we will get old name again
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const added = await Chat.findByIdAndUpdate( //we will search for the chat
    chatId,
    {
      $push: { users: userId }, //we will push the new user
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },//we are pulling the user
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
