const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

const {
  signUp,
  login,
  verifyToken,
  resetPassword,
  requestPasswordReset,
  editUser,
  deleteUser,
  addUser,
  getAllUsers,
} = require("./function");
require("dotenv").config();
const secret = process.env.MONGO_URI;
mongoose.connect(secret);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
// Define the modified authenticate middleware
const authenticate = (req, res, next) => {
  if (
    req.path === "/signup" ||
    req.path === "/login" ||
    req.path === "/forgot" ||
    req.path === "/verify" ||
    req.path === "/reset"
  ) {
    return next();
  }

  try {
    if (!req.header("Authorization")) {
      throw new Error("Please authenticate.");
    }
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

app.use(authenticate);

// Routes
app.post("/signup", async (req, res) => {
  const { name, email, password, gender, phone, location } = req.body;
  try {
    await signUp({ name, email, password, gender, phone, location });
    res.send({ message: "User created" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await login(email, password);
    res.send({ token, user });
  } catch (error) {
    
    res.status(400).send({ error: error.message });
  }
});

app.post("/forgot", async (req, res) => {
  const { email } = req.body;
  try {
    await requestPasswordReset(email);
    res.send({ message: "Password reset email sent" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post("/verify", async (req, res) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    await verifyToken(token.trim());
    res.send({ message: "Token is valid" });
  } catch (error) {
    
    res.status(400).send({ error: error.message });
  }
});

app.post("/reset", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    await resetPassword(token, newPassword);
    res.send({ message: "Password reset successfully" });
  } catch (error) {
    
    res.status(400).send({ error: error.message });
  }
});

app.post("/profile", (req, res) => {
  let token = req.header("Authorization").replace("Bearer ", "");
  try {
    let user = jwt.verify(token.trim(), process.env.JWT_SECRET);
    res.send({ ...user, isValid: true });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post("/profile/editUser", (req, res) => {
  let data = ({ name, email, phone, location, gender } = req.body);
  try {
    editUser(data);
    res.send({ message: "User updated" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post("/profile/delete", async (req, res) => {
  let email = req.body.email;
  try {
    await deleteUser(email);
    res.send({ message: "User deleted" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post("/profile/addUser", (req, res) => {
  const data = req.body;
  try {
    addUser(data);
    res.send({ message: "User added" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post("/profile/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.send(users);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
