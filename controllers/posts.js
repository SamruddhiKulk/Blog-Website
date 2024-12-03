const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const Post = require("../models/post");
const upload = require("../config/multer-config");

module.exports.renderCreatePostForm = (req, res) => {
    res.render('createPost.ejs');
};

module.exports.renderEditPostForm = async (req, res) => {
    try {
        const postId = req.params.id;
        const blog = await Post.findById(postId);  // Fetch post by ID

        if (!blog) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Pass the post object to the view
        res.render('editPost', { blog });  // Change from 'blog' to 'post'
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error while rendering edit post form' });
    }
};

// Handle form submission to create a new post
module.exports.createPost = async (req, res) => {
    const { title, category, content } = req.body;

    let image = {
        url: '',
        fileName: ''
    };

    if (req.file) {
        image.url = `/uploads/${req.file.filename}`; // Store relative path
        image.fileName = req.file.filename; // Store the filename
    }

    try {
        const newPost = new Post({
            title,
            content,
            author: req.user._id,
            category,
            image,
            likes: 0
        
        });

        await newPost.save();
        res.redirect('/profile'); // Redirect after creating the post
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).send("Error creating post");
    }
};


module.exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByIdAndDelete(postId);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Redirect to profile page after successful deletion
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error while deleting post' });
    }
};

module.exports.editPost = async (req, res) => {
    try {
        const { content, category, title } = req.body;
        const post = await Post.findByIdAndUpdate(req.params.id, { content, category, title }, { new: true });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // res.status(200).json(post);
        res.redirect("/profile");
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error });
    }
};

module.exports.getPost =
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id).populate('comments.user'); // Assuming comments have a user reference
            const user = await User.find(req.user);
            if (!post) {
                return res.status(404).send("Post not found");
            }
            res.render("postview", { post , user}); // Render a view with the post data
        } catch (error) {
            console.error("Error fetching post:", error);
            res.status(500).send("Server error");
        }
    };

module.exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (!post.likes.includes(req.body.userId)) {
            post.likes.push(req.body.userId);
        }
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error liking post', error });
    }
};

module.exports.getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'username').populate('reviews');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
};

module.exports.likePost = async (req, res) => {
    try {
        const blog = await Post.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Validate that `likes` is a number, if not set it to 0
        if (typeof blog.likes !== 'number') {
            blog.likes = 0; // Reset to 0 if it's not a number
        }

        blog.likes += 1; // Increment the likes count
        await blog.save();
        res.status(200).json({ likes: blog.likes });
    } catch (error) {
        res.status(500).json({ message: 'Error liking the blog post', error });
    }
};



// Add a comment to a blog post
module.exports.commentPost = async (req, res) => {
    try {
        // Log the incoming request
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);

        // Find the post by id
        const blog = await Post.findById(req.params.id);
        if (!blog) {
            console.log('Post not found');
            return res.status(404).json({ message: 'Post not found' });
        }

        // Validate comment input
        if (!req.body.content) {
            console.log('Validation failed: Missing content');
            return res.status(400).json({ message: 'Content is required' });
        }

        // Ensure req.user is populated (if you're using an authentication mechanism)
        if (!req.user) {
            console.log('User not authenticated');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Find the user by id (assuming req.user contains the user's id)
        const user = await User.findById(req.user._id); // Ensure that req.user has a valid _id
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Create the comment object
        const comment = {
            user: user._id, // Store the user's ID instead of the entire object
            content: req.body.content,
            date: new Date(),
        };

        // Push the comment to the blog's comments array
        // console.log('Adding comment:', comment);
        blog.comments.push(comment);

        // Save the blog with the new comment
        await blog.save();
        console.log('Comment added successfully');
        // res.redirect("/posts");
    } catch (error) {
        // Log the error to identify what's wrong
        console.error('Error in commentPost function:', error.message);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};



module.exports.viewPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); // Fetch post by ID
        const user = await User.findById(req.user._id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('postview', { post , user}); // Render the view with the post data
    } catch (error) {
        res.status(500).send('Server error');
    }
};


// Follow a blog (or an author)
module.exports.followPost = async (req, res) => {
    try {
        const blog = await Post.findById(req.params.id);
        if (!blog.followers.includes(req.body.userId)) {
            blog.followers.push(req.body.userId); // Add follower if not already following
        }
        await blog.save();
        res.status(200).json({ followers: blog.followers.length });
    } catch (error) {
        res.status(500).json({ message: 'Error following the blog' });
    }
};