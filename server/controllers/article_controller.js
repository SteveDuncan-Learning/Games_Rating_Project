//require dependencies
const express = require('express');
const moment = require('moment');

//models
const { User } = require('./../models/user');
const { Article } = require('./../models/article');
const { UserReviews } = require('./../models/user_reviews');

// controller to show home page with list of games, overviews and average user rating
exports.home_ratings_ave_get = function (req, res) {
    Article.find().sort({ _id: 'asc' }).limit(10).exec((err, doc) => {
        if(err) return res.status(400).send(err);
        
        doc.forEach(function (item) {
            // call function to calculate averate rating
            getAve(item.title, function (result) {
                // add value to document
                item["aveRating"] = result;
            })          
        })
        return res.render('home', {
            dashboard: true,
            isAdmin: req.user.role === 1 ? true : false,
            articles: doc
        })
    })
}

// controller to show ratings and reviews for selected game
exports.game_ratings_ave_get = function (req, res) {
    let addReview = req.user ? true : false;
    // find article matching selected game
    Article.findById(req.params.id, "title ownerUsername",(err, article) => {
        // call function to calculate averate rating
        getAve(article.title, function (result) {
            // add value to document
            article["aveRating"] = result;
        })         

        if (err) return res.status(400).send(err);
        // find all reviews matching selected game
        UserReviews.find({ 'postID': req.params.id }).exec((err, userReviews) => {
            res.render('article', {
                date: moment(article.createdAt).format('MM/DD/YY'),
                article,
                review: addReview,
                userReviews
            })
        })
    })
}

// controller to show games with reviews the logged in user has posted
exports.article_reviews_get = function (req, res) {
    if (!req.user) return res.redirect('/login');
    // find all reviews the selected user has posted
    UserReviews.find({ 'ownerID': req.user._id }).exec((err, userReviews) => {

        res.render('user_reviews', {
            dashboard: true,
            isAdmin: req.user.role === 1 ? true : false,
            userReviews
        });
    })
}

// controller to add articles if admin login
exports.user_dashboard_articles_get = function(req, res){
    if (!req.user) return res.redirect('/login');
    res.render('admin_articles', {
        dashboard: true,
        isAdmin: req.user.role === 1 ? true : false
    });
}

// controller to show the add article page
exports.add_article_get = function (req, res) {
    // if not logged in, show login page
    if (!req.user) return res.redirect('/login');
    res.render('admin_articles', {
        dashboard: true,
        isAdmin: req.user.role === 1 ? true : false
    });
}

// controller to add the article to database
exports.add_article_post = function (req, res) {
    const article = new Article({
        ownerUsername: req.user.username,
        ownerID: req.user._id,
        title: req.body.title,
        overview: req.body.review,
        rating: req.body.rating
    });

    article.save((err, doc) => {
        if (err) return res.status(400).send(err);
        res.status(200).send();
    })
}

// controller to add user review to database
exports.user_review_post = function(req, res){
    const userReview = new UserReviews({
        postID: req.body.id,
        ownerUsername: req.user.username,
        ownerID: req.user._id,
        titlePost: req.body.titlePost,
        review: req.body.review,
        rating: req.body.rating
    });

    userReview.save((err, doc) => {
        if (err) return res.status.send(err);
        res.status(200).send();
    })
}

// finction to get the average user review for selected title
function getAve(title, callback) {
    // search criteria to match title and set average rating
    const pipeline = [
        { $match: { "titlePost": title } },
        { $group: { _id: null, rating: { $avg: "$rating" } } },
        { $project: { _id: 0, review: 1, rating: 1 } }
    ]
    // search all user reviews for matching criteria
    UserReviews.aggregate(pipeline, function (err, result) {
        if (err) { console.log(err) }
        // check if array and has value
        if (Array.isArray(result) && result.length) {
            // get the object value
            var ave = (Object.values(result[0]))[0]
            //catch null values for rating
            if(ave===null){ave=0}
            callback(ave);
        } else {
            callback(0)
        }
    })
}
