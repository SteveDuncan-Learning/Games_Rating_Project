const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    title:{
        type:String,
        require:true,
        trim:true
    },
    ownerUsername:{
        type:String,
        require:true,
        trim:true
    },
    overview:{
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
    },
    // aveRating:{
    //     type:Number,
    //     require:true
    // },
    ownerID:{
        type:String,
        require:true
    }
},{timestamps:true});

//////////////////////
// articleSchema.methods.aveRating = function(){

//     var article = this;

//     var pipeline = [
//         {$match: {"titlePost":this.title}},
//         {$group: {_id: null,aveRating: {$avg: "$rating"}}},
//         {$project: {_id: 0,aveRating:1}}
//     ]
//     db.userreviews.aggregate(pipeline, function(err,result){
//         if(err) {console.log(err)}
//         console.log(result)
//     })
// }



//////////////////////
const Article = mongoose.model('Article',articleSchema);

module.exports = {Article}






