const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    
    name: {type:String, required: true},
    content: {type:String, required: true},
    image: {type:String, required: true}
},{
    timestamps:true
})

const Post = mongoose.model('Post', PostSchema);

module.exports = Post
