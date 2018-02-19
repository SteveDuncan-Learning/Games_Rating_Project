const mongoose = require('mongoose');

const userReviewsSchema = mongoose.Schema({
    postID:{
        type:String,
        require:true
    },
    ownerID:{
        type:String,
        require:true
    },
    ownerUsername:{
        type:String,
        require:true,
        trim:true
    },
    titlePost:{
        type:String,
        require:true,
        trim:true
    },
    review:{
        type:String,
        require:true,
        trim:true,
        maxlength:500
    },
    rating:{
        type:Number,
        require:true,
        min:1,
        max:10
    }
},{timestamps:true});

const UserReviews = mongoose.model('UserReviews',userReviewsSchema);

module.exports = {UserReviews}