const express = require("express");
const { protect } = require("../Middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");
const router = express.Router();

//thi route for accessing or creating chat
//this post portect helps to ensure that user is logged in
router.route("/").post(protect, accessChat);
//get is used to get all the chats from database
router.route("/").get(protect, fetchChats);

//for creating grooup
router.route("/group").post(protect,createGroupChat);

//for renaming group and as we are just updating it is put request
router.route("/rename").put(protect,renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);

module.exports = router;
