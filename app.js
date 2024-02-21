const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
// importing routers
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const Blog = require("./models/blog");
const axios = require("axios");

const {
  pre_process,
  refined_request,
  select_top_3,
} = require("./recommendation/utils");

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
app.get("/home", async (req, res) => {
  const allBlogs = await Blog.find({}); // will return all the blogs
  return res.render("allBlogs", {
    user: req.user,
    blogs: allBlogs
  });
});

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}); // will return all the blogs
  // we need to select top3 blogs based on visitors
  const top3 = allBlogs.sort((a,b)=>{
    return b.visited - a.visited;
  })
  console.log("top3 blogs",top3);
  return res.render("home",{
    user: req.user,
    blogs: allBlogs,
    top3: top3.slice(0,3)
  });
});

// creating search functionality
app.post("/search", async (req, res) => {
  // user input query
  const { query } = req.body;
  // getting all the blogs
  const allBlogs = await Blog.find({}); // will return all the blogs
  const id = "something";

  // intialize an empty list
  const bodies = [];
  for (let i = 0; i < allBlogs.length; i++) {
    // we will store title corresponding to the body
    const id = allBlogs[i]._id;
    // console.log(typeof(id));
    const title = allBlogs[i].title;
    const body_content = allBlogs[i].body;
    const combined_string = title + " " + body_content;
    const content = await pre_process(combined_string);
    const data = {
      id,
      content,
    };
    bodies.push(data);
  }

  // request body
  const request_body = {
    created_blog: {
      id: id,
      content: query,
    },
    blog_list: bodies,
  };
  let response;
  // making request to the server to get the similiarities between the blogs
  try {
    response = await axios.post("http://127.0.0.1:8000/tagify/", request_body);
  } catch (error) {
    console.error("Error making request:", error.message);
    throw error;
  }

  // we're getting the similiarities between the blogs
  let results = response.data;
  console.log("results", results);
  // selecting top three
  // 1. sorting results on the basis of similarities
  // 2. selecting top 3 blogs with highest similarities

  // sorting the results in the basis of similiarities
  const sortedSimiliarities = results.similarities.sort((a, b) => {
    return b.similarity - a.similarity;
  });

  // filtering on the basis of values present ( if the similiarity is not 0)
  results.similarities = sortedSimiliarities.filter(
    (item) => item.similarity !== 0
  );

  // selecting top 3 blogs with highest similiarity
  const top3 = await select_top_3(0, 3, results);

  if (top3.length === 0) {
    return res.render("searchResults", {
      user: req.user,
      blogs: [],
    });
  }

  console.log("top3", top3);

  // finding all these blogs from the database
  let selectedBlogs = await Blog.find({ _id: { $in: top3 } });
  selectedBlogs = selectedBlogs.reverse();
  return res.render("searchResults", { user: req.user, blogs: selectedBlogs });
});

// using the user router
app.use("/user", userRouter);

// using the blog router for all the blog related requests
app.use("/blog", blogRouter);

// starting the server
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
