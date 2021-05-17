const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const Member = require('../models/member');

// Display Homepage form
exports.messageboard_get = (req, res, next) => {

  Post.find()
  .populate('member', 'username firstname lastname')
  .exec((err, list_of_posts) => {
    if (err) { return next(err); }
    //Successful, so render
    
    res.render('index', { title: 'MessageBoard', posts: list_of_posts, member: req.member });
  });
};


exports.new_post_get = (req, res, next) => { 
  res.render('new-post', { title: 'New Post'});
}

// POST new post
exports.new_post_post = [

  // Validation and sanitization
  body('title')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Enter a title.')
    .escape(),
  body('post')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Enter a message.')
    .escape(),  
  
  (req, res, next) => { 
    const errors = validationResult(req);

    const newPost = new Post({
      title: req.body.title,
      post: req.body.post,
      member: req.user._id,
    });    

    if (!errors.isEmpty()) {
      res.render('new-post', {
        title: 'New Post',
        errors: errors.array(),
      });
    } else {
      newPost.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      })
    }
  }
];

// Handle post delete on POST.
exports.delete_post_post = (req, res, next) => {
  Post.findByIdAndDelete(req.params.id, (err, message) => {
    if (err) { return next(err); }
    res.redirect('/');
  })
};