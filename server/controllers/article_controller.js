var express = require('express');
const moment = require('moment');

//models
const { User } = require('./../models/user');
const { Article } = require('./../models/article');
const { UserReviews } = require('./../models/user_reviews');

exports.home_ratings_ave_get = function (req, res) {
    Article.find().sort({ _id: 'asc' }).limit(10).exec((err, doc) => {
        if(err) return res.status(400).send(err);
        
        doc.forEach(function (item) {
            getAve(item.title, function (result) {
                item["aveRating"] = result;
            })          
        })
        return res.render('home', {
            articles: doc
        })
    })
}

exports.game_ratings_ave_get = function (req, res) {
    let addReview = req.user ? true : false;

    Article.findById(req.params.id, "title ownerUsername",(err, article) => {

        getAve(article.title, function (result) {
            article["aveRating"] = result;
        })         

        if (err) res.status(400).send(err);

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

exports.article_reviews_get = function (req, res) {
    if (!req.user) return res.redirect('/login');
    UserReviews.find({ 'ownerID': req.user._id }).exec((err, userReviews) => {


        res.render('admin_reviews', {
            dashboard: true,
            isAdmin: req.user.role === 1 ? true : false,
            userReviews
        });
    })
}

// add articles if admin login
exports.user_dashboard_articles_get = function(req, res){
    if (!req.user) return res.redirect('/login');
    res.render('admin_articles', {
        dashboard: true,
        isAdmin: req.user.role === 1 ? true : false
    });
}

exports.add_article_get = function (req, res) {
    if (!req.user) return res.redirect('/login');
    res.render('admin_articles', {
        dashboard: true,
        isAdmin: req.user.role === 1 ? true : false
    });
}

exports.add_article_post = function (req, res) {
    const article = new Article({
        ownerUsername: req.user.username,
        ownerID: req.user._id,
        title: req.body.title,
        overview: req.body.review,
        rating: req.body.rating
    });

    article.save((err, doc) => {
        if (err) res.status(400).send(err);
        res.status(200).send();
    })
}

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

function getAve(title, callback) {
    const pipeline = [
        { $match: { "titlePost": title } },
        { $group: { _id: null, rating: { $avg: "$rating" } } },
        { $project: { _id: 0, review: 1, rating: 1 } }
    ]
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
