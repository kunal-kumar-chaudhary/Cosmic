// in this file, we wll handle the routes for blog related requests
const Blog = require("../models/blog");
const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");

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

  // below we will send the blogs similiar to the blog
  const allBlogs = await Blog.find({});
  console.log(blog.createdBy);
  return res.render("blog", {
    user: req.user,
    blog,
    allBlogs
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

module.exports = router;
