// in this file, we wll handle the routes for blog related requests 

const { Router } = require('express');
const router = Router();

router.get("/", (req, res)=>{
    return res.send("Hello from blog");
});

router.get("/add-new", (req, res)=>{
    return res.render("addBlog", {
        user: req.user,
    });
});

module.exports = router;