const {Schema, model} = require("mongoose");

const blogSchema = new Schema({
    title:{
        type: String,
        required:true,
    },
    body:{
        type: String,
        required:true,
    },
    coverImageURL:{
        type: String,
        required: false,
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

const Blog = model("Blog", blogSchema);

module.exports = Blog;