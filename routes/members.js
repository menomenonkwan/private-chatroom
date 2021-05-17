const express = require('express');
const router = express.Router();

const member_controller = require('../controllers/memberController');


/* GET home page. */
router.get("/", (req, res) => {
  res.redirect('/posts');
});

/* GET & POST Sign-Up */
router.get("/sign-up", member_controller.sign_up_get);
router.post("/sign-up", member_controller.sign_up_post);

/* GET & POST Log-In */
router.get("/log-in", member_controller.log_in_get);
router.post("/log-in", member_controller.log_in_post);

/* GET Log-Out */
router.get("/log-out", member_controller.log_out_get);

module.exports = router;
