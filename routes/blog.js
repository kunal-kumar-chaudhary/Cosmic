// in this file, we wll handle the routes for blog related requests
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const { Router } = require("express");
const { refined_request, select_top_3 } = require("../recommendation/utils");
const router = Router();
const multer = require("multer");
const path = require("path");
const { default: mongoose } = require("mongoose");

// creating a storage using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads"));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

// upload instance
const uploads = multer({ storage: storage });

router.get("/addNew", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  // grabbing the id from the request params
  // below we are grabbing the blog coressponding to the blog id
  // and populating the createdBy field with the user object
  const blog = await Blog.findById(req.params.id).populate("createdBy");

  // fetching the comments as well for this blog
  const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");

  // grabbing all the blogs from the database
  // this will return us the array of documents
  const allBlogs = await Blog.find({});
  let top3;
  let recommendedBlogs;
  let top3_converted;
  try {
    console.log("point1")
    const results = await refined_request(blog, allBlogs);
    console.log("point2")
    top3 = await select_top_3(1,4,results);
    console.log("point3")
    top3_converted = top3.map((item)=> new mongoose.Types.ObjectId(item))
  } catch (err) {
    console.log(err);
  }
  console.log(top3_converted);
  // now using the top_3 id's to get the blogs
  // with the highest similiarity
  try {
    recommendedBlogs = await Blog.find({ _id: { $in: top3_converted } });
  } catch (err) {
    console.log(err.message);
  }
  // reverse the array to get the blogs in the order of highest similiarity
  recommendedBlogs = recommendedBlogs.reverse();
  console.log(recommendedBlogs[0].title);
  // console.log(blog.createdBy);
  return res.render("blog", {
    user: req.user,
    blog,
    recommendedBlogs,
    comments,
  });
});

// note- create a new user because createdBy field was not populated before becuase we passed wrong id

router.post("/", uploads.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    title,
    body,
    coverImageURL: `/uploads/${req.file.filename}`,
    createdBy: req.user.id,
  });
  /* here we will implement cosine similiarity with the blog title
    and will recommend the user with the blogs with the highest cosine similiarity
    */

  // dynamic routing for the blog page
  return res.redirect(`/blog/${blog._id}`);
});

router.post("/comment/:blogId", async (req, res)=>{
  await Comment.create({
    body: req.body.content,
    createdBy: req.user.id,
    blogId: req.params.blogId,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
})


module.exports = router;
