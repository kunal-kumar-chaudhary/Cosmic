const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
// importing routers
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const Blog = require("./models/blog");
const { default: axios } = require("axios");
const {pre_process, refined_request, select_top_3} = require("./recommendation/utils");

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
app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}) // will return all the blogs
  return res.render("home", {
    user: req.user,
    blogs: allBlogs
  });
});

// creating search functionality
app.post("/search", async (req, res)=>{
  const { query } = req.body;
  console.log(query);
  const allBlogs = await Blog.find({}) // will return all the blogs
  // try{
  //   result = await axios({});
  // }
  // catch(err){
  //   console.log(err.message);
  // }
  return res.render("searchResults", {user: req.user,
  blogs: allBlogs});
})


// using the user router
app.use("/user", userRouter);

// using the blog router for all the blog related requests
app.use("/blog", blogRouter);

// starting the server
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
