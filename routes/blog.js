// in this file, we wll handle the routes for blog related requests
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const { Router } = require("express");
const { refined_request, select_top_3 } = require("../recommendation/utils");
const router = Router();
const multer = require("multer");
const path = require("path");
const { default: mongoose } = require("mongoose");
const { default: axios } = require("axios");

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

// will handle both get and post request

router.all("/:id", async (req, res) => {
  // grabbing the id from the request params
  // below we are grabbing the blog coressponding to the blog id
  // and populating the createdBy field with the user object
  let blog = await Blog.findById(req.params.id).populate("createdBy");
  blog.visited++; // incrementing the visited field by 1
  await blog.save();
  const filtered_comments = [];
  // fetching the comments as well for this blog
  let comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  let summary;
  let request_blog = {
    "text": blog.body,
  };
  // getting summary of the blog
  if (req.body.summary_button === 'clicked'){
  summary = await axios.post(
    "http://127.0.0.1:8000/summary/",
    request_blog
  );
  summary = summary.data.message[0].summary_text
  }
  // getting username and the comment corresponding to the user
  comments.forEach((comment) => {
    filtered_comments.push({
      id: comment._id,
      comment: comment.body,
    });
  });
  const request_body = {
    comments_list: filtered_comments,
  };
  // making request to the server usings axios
  // to get the sentiment analysis of the comments
  let response;
  try {
    response = await axios.post(
      "http://127.0.0.1:8000/sentiment/",
      request_body
    );
  } catch (error) {
    console.error("Error making request:", error.code);
    throw error;
  }
  let sentiment = response.data;
  let ids;
  const selectedValue = req.query.selectedValue;
  if (selectedValue) {
    `
    what we are doing:-

    we are iterating over every item in the sentiment object
    and then we are iterating over the scores array
    and then we are sorting the scores in descending order
    and then we are grabbing the highest value from the scores array
    and then we are checking if the selected value is equal to the highest value
    and then we are pushing the id to the names array
    and then we are querying the database to get the comments corresponding to the names array
    `;
    ids = [];

    sentiment.sentiment_list.forEach((item) => {
      const { neg, neu, pos, compound } = item.analysis.scores;
      const scores = [neg, neu, pos];
      scores.sort((a, b) => b - a);
      let highestValue = scores[0];
      if (item.analysis.scores[selectedValue] === highestValue) {
        ids.push(item.id);
      }
    });
    comments = await Comment.find({ _id: { $in: ids } }).populate("createdBy");
  }

  // grabbing all the blogs from the database
  // this will return us the array of documents
  const allBlogs = await Blog.find({});
  let top3;
  let recommendedBlogs;
  let top3_converted;
  try {
    const results = await refined_request(blog, allBlogs);
    top3 = await select_top_3(1, 4, results);
    top3_converted = top3.map((item) => new mongoose.Types.ObjectId(item));
  } catch (err) {
    console.log(err);
  }
  // now using the top_3 id's to get the blogs
  // with the highest similiarity
  try {
    recommendedBlogs = await Blog.find({ _id: { $in: top3_converted } });
  } catch (err) {
    console.log(err.message);
  }

  // sorting the recommended blogs in the order of highest similiarity as we have the id's
  // we have to do this as there is no inherent function in mongose to sort the blogs.
  let sortedRecommendedBlogs = [];
  top3.forEach((id) => {
    recommendedBlogs.forEach((blog) => {
      if (blog._id.toString() === id.toString()) {
        sortedRecommendedBlogs.push(blog);
      }
    });
  });
  recommendedBlogs = sortedRecommendedBlogs;

  return res.render("blog", {
    user: req.user,
    blog,
    recommendedBlogs,
    comments,
    summary,
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
  // dynamic routing for the blog page
  return res.redirect(`/blog/${blog._id}`);
});

// route to add a comment to the blog
router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    body: req.body.content,
    createdBy: req.user.id,
    blogId: req.params.blogId,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
