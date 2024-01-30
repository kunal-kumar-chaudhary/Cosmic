const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
// importing routers
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");

const port = 3000;

// connecting mongodb database
mongoose
  .connect("mongodb://localhost:27017/cosmic")
  .then((e) => console.log("connected to database"));

// setting up the view engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// setting up middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token")); // this middleware will check for the token in the cookie and attach the user to the request object if the token is valid

// home page
app.get("/", (req, res) => {
  return res.render("home", {user: req.user});
});

// using the user router
app.use("/user", userRouter);

// using the blog router for all the blog related requests
app.use("/blog", blogRouter);

// starting the server
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
