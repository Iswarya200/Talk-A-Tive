const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to Create the User");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//  /api/user?search=oiyush
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search //we will store the searching query in keyword
    ? {
        //now we will check if the keyword matches with name or email so we use that operator $or
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },//regex-used to match the strings
          { email: { $regex: req.query.search, $options: "i" } },//i-caseinsensitive
        ],
      }
    : {};//else weill return nothing

  //we will store all the ids matching the keyword except the user who loggedin(ne-not equal to) 
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });//to not to share the user id we are using auth middleware
  res.send(users);//returning it
});
module.exports = { registerUser, authUser, allUsers };
