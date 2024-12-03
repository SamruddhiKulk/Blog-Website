const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/isLoggedIn.js");
const blog = require("../models/post.js");
const user = require("../models/user.js");
const upload = require("../config/multer-config.js");

const postController = require("../controllers/posts");

router.route("/create")
    .get(postController.renderCreatePostForm)
    .post(authenticateToken, upload.single('image'), postController.createPost);

router.route("/edit/:id")
    .get(postController.renderEditPostForm)
    .post(authenticateToken, postController.editPost);

router.route("/delete/:id")
    .post(authenticateToken, postController.deletePost);

router.route("/like/:id")
    .post(authenticateToken, postController.likePost);

router.route("/comment/:id")
    .post(authenticateToken, postController.commentPost);

router.route("/follow/:id")
    .post(authenticateToken, postController.followPost);

router.route("/post/:id")
    .get(postController.getPost);

    router.route("/posts/:id")
    .get( postController.viewPost);

module.exports = router;                       