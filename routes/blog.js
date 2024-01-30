// in this file, we wll handle the routes for blog related requests 
const Blog = require("../models/blog");
const { Router } = require('express');
const router = Router();
const multer = require("multer");
const path = require("path");

// creating a storage using multer
const storage = multer.diskStorage({
    destination: function(req, flle, cb){
      cb(null, path.resolve("./public/uploads"));
    },
    filename: function(req, file, cb){
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  })
  
  // upload instance
const uploads = multer({storage: storage});
  

router.get("/addNew", (req, res)=>{
    return res.render("addBlog", {
        user: req.user,
    });
});


router.get("/:id", async (req, res)=>{
   // grabbing the id from the request params
   // below we are grabbing the blog coressponding to the blog id
   // and populating the createdBy field with the user object
   console.log(req.params.id)
   const blog = await Blog.findById(req.params.id).populate("createdBy");
   console.log(blog)
    return res.render("blog",{
        blog,
        user:req.user,
    })
});

router.post("/", uploads.single("coverImage"),  async (req, res)=>{
    const {title, body} = req.body;
    const blog = await Blog.create({
        title,
        body,
        coverImageURL: `/uploads/${req.file.filename}`,
        createdBy: req.user._id,
    })
    // dynamic routing for the blog page
    return res.redirect(`/blog/${blog._id}`);
});


module.exports = router;