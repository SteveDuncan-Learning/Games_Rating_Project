var express = require('express');
const moment = require('moment');
const { auth } = require('./../middleware/auth');

//models
const { User } = require('./../models/user');
const { UserReviews } = require('./../models/user_reviews');

exports.user_login_get = function(req, res){
    if (req.user) return res.redirect('/dashboard');
    res.render('login');
}

exports.user_logout = function(req, res){
    req.user.deleteToken(req.token, (err, user) => {
        if (err) return res.status(400).send(err);
        res.redirect('/');
    })
}

exports.user_register_get = function(req, res){
    if (req.user) return res.redirect('/dashboard');
    res.render('register');
}

exports.user_dashboard_get = function(req, res){
    if (!req.user) return res.redirect('/login');
    
    res.render('dashboard', {
        dashboard: true,
        username: req.user.username,
        isAdmin: req.user.role === 1 ? true : false
    });
}

exports.user_dashboard_articles_get = function(req, res){
    if (!req.user) return res.redirect('/login');
    res.render('admin_articles', {
        dashboard: true,
        isAdmin: req.user.role === 1 ? true : false
    });
}

exports.user_login_post = function (req, res) {
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
}

exports.user_register_get = function (req, res) {
    if (req.user) return res.redirect('/dashboard');
    res.render('register')
}

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
