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
    ownerID:{
        type:String,
        require:true
    }
},{timestamps:true});


const Article = mongoose.model('Article',articleSchema);

module.exports = {Article}






