const {Schema, model} = require("mongoose");

const commentSchema = new Schema({
    body:{
        type: String,
        required:true,
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    blog:{
        type: Schema.Types.ObjectId,
        ref: "Blog",
    },
}, {timestamps: true});

const Comment = model("Comment", commentSchema);

module.exports = Comment;