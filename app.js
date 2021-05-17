require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const compression = require('compression');
const helmet = require('helmet');

const memberRouter = require('./routes/members');
const postRouter = require('./routes/posts');
const Member = require('./models/member');

var app = express();

app.locals.makePrivateQ = (str) => {
  return str.split('').map(char => char === ' ' ? ' ' : '?').join('');
}
app.locals.makePrivateX = (str) => {
  return str.split('').map(char => char === ' ' ? ' ' : 'x').join('');
}

// Mongoose Connection 
const mongoose = require('mongoose');
const mongoDB = process.env.DB_CONNECTION_STRING;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(flash());
app.use(compression());
app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

passport.use(
  new LocalStrategy((username, password, done) => {
    Member.findOne({ username: username }, (err, member) => {
      if (err) { 
        return done(err);
      };
      if (!member) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, member.password, (err, res) => {
        if (res) {
          return done(null, member);
        } else {
          return done(null, false, { message: "incorrect password" });
        }
      });
    });
  })
);

passport.serializeUser(function(member, done) {
  done(null, member.id);
});

passport.deserializeUser(function(id, done) {
  Member.findById(id, function(err, member) {
    done(err, member);
  });
});

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', memberRouter);
app.use('/posts', postRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
