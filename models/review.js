const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    comment: {
        type: String
    },
    rating: {
        type: Number,
        default: 1
    }

},
{timestamps: true})

module.exports = mongoose.model('Review', reviewSchema)