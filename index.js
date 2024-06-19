const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.MONGO_URI;
mongoose.connect(secret);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};
