const User = require("./mongo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("./mailgun");
require("dotenv").config();

const signUp = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await User.create({ ...data, password: hashedPassword });
  } else {
    throw new Error("User Already Exists");
  }
};

const login = async (email, password) => {
  let user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }
  user = user.toObject();
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.__v;
  delete user._id;
  const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
    expiresIn: "3h",
  });
  return { token, user };
};

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  await sendMail(
    user.email,
    "Password Reset",
    "Password Reset",
    user.name,
    token
  );
  console.log(token);
  return true;
};

const getAllUsers = async () => {
  let users = await User.find();
  users = users.map((user) => {
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    delete user.__v;
    delete user._id;
    return user;
  });
  return users;
};

const verifyToken = async (token) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error("Password reset token is invalid or has expired.");
  } else {
    return true;
  }
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error("Password reset token is invalid or has expired.");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};


const editUser = async (data) => {
  const { oldMail } = data;
  console.log(data);
  const existing = await User.findOne({ email: oldMail });
  if (existing) {
    
    await User.updateOne({ email:oldMail }, { $set: { ...data } });
  } else {
    throw new Error("User does not exist");
  }
};
const deleteUser = async (email) => {
  const existing = await User.findOne({ email });
  if (existing) {
    await User.deleteOne({ email });
  } else {
    throw new Error("User does not exist");
  }
};

//add user without password
const addUser = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (!existing) {
    await User.create(data);
  } else {
    throw new Error("User Already Exists");
  }
};

module.exports = {
  deleteUser,
  signUp,
  login,
  editUser,
  requestPasswordReset,
  resetPassword,
  addUser,
  verifyToken,
  getAllUsers,
};
