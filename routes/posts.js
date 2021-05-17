var express = require('express');
var router = express.Router();

const post_controller = require('../controllers/postController');

/* GET users listing. */
router.get('/', post_controller.messageboard_get);

router.get("/new-post", post_controller.new_post_get);
router.post("/new-post", post_controller.new_post_post);

// POST request to delete post.
router.post('/delete/:id', post_controller.delete_post_post);

module.exports = router;
