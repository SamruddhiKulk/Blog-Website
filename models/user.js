const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    profilepic: {
        type: String,
        default: "/default.jpeg"
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    followers: [
        {

            users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            count: { type: Number, default: 0 }
            // type: mongoose.Schema.Types.ObjectId,
            // ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    bio: String
},
    {
        timestamps: true
    })

module.exports = mongoose.model('User', userSchema)