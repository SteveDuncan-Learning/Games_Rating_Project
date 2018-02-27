//require dependencies
const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const config = require('./config/config').get(process.env.NODE_ENV);

//create express app
const app = express();
//set port to use
const port = process.env.PORT;

//set path for static files and views
app.use('/css',express.static(__dirname + './../public/css'));
app.use('/js',express.static(__dirname + './../public/js'));

//set template engine to use
app.engine('hbs',hbs({
    extname:'hbs',
    defaultLayout:'main',
    layoutsDir: __dirname + './../views/layouts',
    partialsDir: __dirname + './../views/partials'
}));
app.set('view engine','hbs')

//set up DB
mongoose.promise = global.Promise;
mongoose.connect(config.DATABASE);

//middleware

app.use(bodyParser.json());
app.use(cookieParser());

//define or require routes
const router = require('./routes/routes.js')
app.use('/', router);

//set up server
app.listen(config.PORT,()=>{
    console.log(`Started at port ${config.PORT}`)
})
