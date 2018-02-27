// require dependencies
const express = require('express');
const moment = require('moment');
const { auth } = require('./../middleware/auth');

//models
const { User } = require('./../models/user');
const { UserReviews } = require('./../models/user_reviews');

// controller to show login page 
exports.user_login_get = function(req, res){
    if (req.user) return res.redirect('/dashboard');
    res.render('login');
}

// controller to log out user
exports.user_logout = function(req, res){
    req.user.deleteToken(req.token, (err, user) => {
        if (err) return res.status(400).send(err);
        res.redirect('/');
    })
}

// controller to show user registration page
exports.user_register_get = function(req, res){
    if (req.user) return res.redirect('/dashboard');
    res.render('register');
}

// controller to show user dashboard
exports.user_dashboard_get = function(req, res){
    if (!req.user) return res.redirect('/');
    
    res.render('dashboard', {
        dashboard: true,
        username: req.user.username,
        isAdmin: req.user.role === 1 ? true : false
    });
}

// controller to login user
exports.user_login_post = function (req, res) {
    // check if email already registered
    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.status(400).json({ message: 'Auth failed, wrong email' })
        // user validation
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (err) throw err;
            if (!isMatch) return res.status(400).json({ message: 'Auth failed, wrong password' });
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie('auth', user.token).send('ok');
            })
        })
    })
}

// controller to add user registration to database
exports.user_register_post = function(req, res){
    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.status(400).send(err);

        user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);
            res.cookie('auth', user.token).send('ok');
        })
    })
}
