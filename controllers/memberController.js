const passport = require("passport");
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Member = require('../models/member');
const Post = require('../models/post');


// Display Sign-Up form
exports.sign_up_get = (req, res, next) => {
  res.render("sign-up-form", { title: 'Sign-Up' });
}

// POST Sign-Up form
exports.sign_up_post = [

    // Validation and sanitization
  body('firstname')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Enter a name.')
    .escape(),
  body('lastname')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Enter a last name.')
    .escape(),
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('The username must have at least 3 characters.')
    .custom(async (value) => {
      const userCheck = await Member.findOne({ username: value });
      if (userCheck !== null) {
        return Promise.reject();
      }
      return Promise.resolve();
    })
    .withMessage('Username already in use.')
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('The password must have at least 8 characters.')
    .escape(),
  body('confirm-password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Confirm password.')
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation is incorrect');
      } else {
        return true;
      }
    }),
  body('secret')
    .trim()
    .escape(),
    
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      res.render('sign-up-form', {
        title: "Sign Up",
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        errors: errors.array({ onlyFirstError: true }),
      });
    } else {
      // Success

      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
          return next(err);
        }
        console.log(req.body);
        const member = new Member({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          username: req.body.username,
          password: hashedPassword,
          admin: req.body.secret === 'password' ? true : false,
        }).save(err => {
          if (err) { 
            return next(err);
        };
          res.render("log-in-form", { title: 'Log-In', user: req.body.username });
        });
      });
    }
  }
];

// Display Log-In form
exports.log_in_get = (req, res, next) => {
  res.render("log-in-form", { 
    title: 'Log-In',
    user: '',
  });
};

// POST Log-In form
exports.log_in_post = [
  // Validation and Sanitation
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Enter a username.')
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Enter a password.')
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {      
      res.render('log-in-form', {
        title: 'Log-In',
        username: req.body.username,
        errors: errors.array(),
      });
    }
    
      passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { 
          return res.render('log-in-form', {
          title: 'Log-In',
          user: req.body.username,
          errors: errors.array(),
        }); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/');
        });
      })(req, res, next);
  },
];

// Log-Out
exports.log_out_get = (req, res, next) => {
  req.logout();
  res.redirect("/");
}
