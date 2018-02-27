//require dependencies
const express = require('express');
const router = express.Router();
const moment = require('moment');

//require the controllers
const article_controller = require('./../controllers/article_controller.js')
const user_controller = require('./../controllers/user_controller.js')

//require the models
const { User } = require('./../models/user');
const { Article } = require('./../models/article');
const { UserReviews } = require('./../models/user_reviews');

const { auth } = require('./../middleware/auth');

//GET routes
// landing page is user login
router.get('/', auth, user_controller.user_login_get);
// home page
router.get('/articles', auth, article_controller.home_ratings_ave_get);
// login page
router.get('/login', auth, user_controller.user_login_get);
// register page
router.get('/register', auth, user_controller.user_register_get);
// ratings and reviews for selected game
router.get('/games/:id', auth, article_controller.game_ratings_ave_get);
// user dashboard
router.get('/dashboard', auth, user_controller.user_dashboard_get)
// add article page
router.get('/dashboard/articles', auth, article_controller.add_article_get)
// reviews by logged in user
router.get('/dashboard/reviews', auth, article_controller.article_reviews_get)
// logout
router.get('/dashboard/logout', auth, user_controller.user_logout);

//POST routes
// register user
router.post('/api/register', user_controller.user_register_post);
// login user
router.post('/api/login', user_controller.user_login_post);
// add article
router.post('/api/add_article', auth, article_controller.add_article_post);
// add user review
router.post('/api/user_review',auth, article_controller.user_review_post);

module.exports = router;