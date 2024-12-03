const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref:"user",   
    // },
    date: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [{ user: String, content: String, date: Date }],
    followers: {
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        count: { type: Number, default: 0 }
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    category: {
        type: String,
        required: true
    },
    image: {
       url : String,
       fileName : String
    },
},
    {
        timestamps: true
    })

module.exports = mongoose.model('Post', postSchema);