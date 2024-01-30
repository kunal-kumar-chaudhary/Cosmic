// in this file, we wll handle the routes for user related requests
const { Router } = require("express");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");

const router = Router();

// --------------------- get requests -------------------

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

// --------------------- post requests -------------------

router.post("/signin", async (req, res) => {
  // grabbing the email and password from the request body
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (err) {
    return res.render("signin", {
      error: "Signin invalid, please try again with correct credentials"
    });
  }
});

router.post("/signup", async (req, res) => {
  // grabbing the user input email and password
  const { fullName, email, password } = req.body;
  await User.create({ fullName, email, password });
  return res.redirect("/user/signin");
});

router.get("/signout", (req, res) => {
  // clearing the cookie
  res.clearCookie("token");
  return res.redirect("/");
});

// exporting the router so that we can use it in app.js
module.exports = router;
