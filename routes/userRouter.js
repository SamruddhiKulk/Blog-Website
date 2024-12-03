const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/isLoggedIn.js");
const blog = require ("../models/post.js");
const user = require ("../models/user.js");

const userController = require("../controllers/user.js");

router.route("/signup").get(userController.renderSignUpForm)
                       .post(userController.signup);

router.route("/login").get(userController.renderLoginForm)
                       .post(userController.login); 
                       
router.route("/profile").get(authenticateToken, userController.renderProfile);

router.route("/follow/:id").post(authenticateToken, userController.followUser);

router.route('/:id/followers-json').get(authenticateToken, userController.getFollower);

// router.route("/profile/:id").get(authenticateToken, userController.getProfile);


module.exports = router;