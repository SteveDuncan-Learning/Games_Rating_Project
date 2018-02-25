var express = require('express');
var router = express.Router();
const moment = require('moment');

//models
const { User } = require('./../models/user');
const { Article } = require('./../models/article');
const { UserReviews } = require('./../models/user_reviews');



const { auth } = require('./../middleware/auth');

//GET
// router.get('/',(req,res)=>{

//     Article.find().sort({_id:'asc'}).limit(10).exec((err,doc)=>{
//         if(err) return res.status(400).send(err);
//         res.render('home',{
//             articles:doc
//         })
//     })

    
// })

function getAve(title, callback) {
    const pipeline = [
        { $match: { "titlePost": title } },
        { $group: { _id: null, rating: { $avg: "$rating" } } },
        { $project: { _id: 0, review: 1, rating: 1 } }
    ]
    UserReviews.aggregate(pipeline, function (err, result) {
        if (err) { console.log(err) }
        if (Array.isArray(result) && result.length) {
            // console.log(result)
            const ave = (Object.values(result[0]))[0]
            // console.log("Ave rating: " + ave)
            callback(ave);
        } else {
            callback(0)
        }
    })
        
}

router.get('/', (req, res) => {
    Article.find().sort({ _id: 'asc' }).limit(10).exec((err, doc) => {
        if(err) return res.status(400).send(err);
        
        doc.forEach(function (item) {
            // console.log(item.title)
            getAve(item.title, function (result) {
                console.log(item.title + ": " + result)
                item["aveRating"] = result;
            })          
        })
        return res.render('home', {
            articles: doc
        })
    })
})

router.get('/register', auth, (req, res) => {
    if (req.user) return res.redirect('/dashboard');
    res.render('register')
})

router.get('/login', auth, (req, res) => {
    if (req.user) return res.redirect('/dashboard');
    res.render('login');
})

router.get('/games/:id', auth, (req, res) => {

    let addReview = req.user ? true : false;

    Article.findById(req.params.id, (err, article) => {
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
})

router.get('/dashboard', auth, (req, res) => {
    if (!req.user) return res.redirect('/login');
    
    res.render('dashboard', {
        dashboard: true,
        username: req.user.username,
        isAdmin: req.user.role === 1 ? true : false
    });
})

router.get('/dashboard/articles', auth, (req, res) => {
    if (!req.user) return res.redirect('/login');
    res.render('admin_articles', {
        dashboard: true,
        isAdmin: req.user.role === 1 ? true : false
    });
})

router.get('/dashboard/reviews', auth, (req, res) => {

    if (!req.user) return res.redirect('/login');
    UserReviews.find({ 'ownerID': req.user._id }).exec((err, userReviews) => {


        res.render('admin_reviews', {
            dashboard: true,
            isAdmin: req.user.role === 1 ? true : false,
            userReviews
        });
    })
})

router.get('/dashboard/logout', auth, (req, res) => {

    req.user.deleteToken(req.token, (err, user) => {
        if (err) return res.status(400).send(err);
        res.redirect('/');
    })
})

//POST
router.post('/api/register', (req, res) => {

    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.status(400).send(err);

        user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);
            res.cookie('auth', user.token).send('ok');
        })
    })
})

router.post('/api/login', (req, res) => {

    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.status(400).json({ message: 'Auth failed, wrong email' })

        user.comparePassword(req.body.password, function (err, isMatch) {
            if (err) throw err;
            if (!isMatch) return res.status(400).json({ message: 'Auth failed, wrong password' });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie('auth', user.token).send('ok');
            })
        })
    })
})

router.post('/api/add_article', auth, (req, res) => {

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
})

router.post('/api/user_review', auth, (req, res) => {
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
})

module.exports = router;