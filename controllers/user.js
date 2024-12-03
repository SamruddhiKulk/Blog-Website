const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const Post = require("../models/post");


module.exports.renderIndex = async (req, res) => {
    try {
        const blogs = await Post.find(); // Fetch blogs
        const user = req.user; // Assuming you have user data from authentication (e.g., Passport.js)
        
        let followingIds = [];
        if (user) {
            const currentUser = await User.findById(user._id).populate('followers', '_id');
            followingIds = currentUser.followers.map(follower => follower._id.toString());
        }

        // Map through blogs to check if the logged-in user is following each author
        const blogsWithFollowingStatus = blogs.map(blog => {
            const isFollowing = followingIds.includes(blog.author.toString());
            return { ...blog._doc, isFollowing }; // Spread operator to add isFollowing to blog object
        });

        res.render('index', { blogs: blogsWithFollowingStatus, user }); // Pass updated blogs with following status
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Render Sign-up Form
module.exports.renderSignUpForm = (req, res) => {
    res.render("signup.ejs");
};

// Sign-up logic with hashed password and JWT
module.exports.signup = async (req, res) => {
    let { email, password, username, name, bio } = req.body;

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        user = new User({
            username,
            name,
            email,
            password: hashedPassword,
            bio
        });

        await user.save();

        // Redirect after successful sign-up
        res.redirect("/login");
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
    res.render("login.ejs");
};

// Login logic with JWT token creation
module.exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials!' });
        }

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'yourSecretKey');

        // Set token in a cookie
        res.cookie('token', token, { httpOnly: true });

        // Redirect to profile page after login
        res.status(200).redirect("/");
    } catch (err) {
        res.status(401).json({ msg: 'Something went wrong' });
    }
};


module.exports.renderProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);  
        const blogs = await Post.find({ author: req.user._id }); 
        // const isFollowing = user.followers.some(follower => follower._id.equals(req.user._id));

        res.render('profile', {
            user: user,
            blogs: blogs,
            // isFollowing
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

module.exports.followUser = async (req, res) => {
    try {
        const postId = req.params.id; // Post ID from params
        const followerId = req.user._id; // Follower ID from the request body

        console.log(`Post ID: ${postId}, Follower ID: ${followerId}`); // Debugging

        // Validate if followerId is provided
        if (!followerId) {
            console.log('Follower ID is missing');
            return res.status(400).json({ message: 'Follower ID is required' });
        }

        // Find the post by ID
        const post = await Post.findById(postId); // Only fetch the post, no need to populate

        // Check if the post exists
        if (!post) {
            console.log('Post not found');
            return res.status(404).json({ message: 'Post not found' });
        }

        // Get the author's ID from the post model
        const authorId = post.author; // This is the ObjectId of the author

        // Find the author by their ID
        const author = await User.findById(authorId); // Fetch the author using their ID
        if (!author) {
            console.log('Author not found');
            return res.status(404).json({ message: 'Author not found' });
        }

        console.log('Author ID:', authorId); // Debugging

        // Check if the user is already following the author
        if (!author.followers.includes(followerId)) {
            author.followers.push(followerId); // Add follower if not already following
            await author.save();
            return res.status(200).json({ message: 'Followed successfully', followers: author.followers.length });
        } else {
            // Unfollow logic: if already following, remove the follower
            author.followers = author.followers.filter(follower => follower.toString() !== followerId);
            await author.save();
            return res.status(200).json({ message: 'Unfollowed successfully', followers: author.followers.length });
        }
    } catch (error) {
        console.error('Error following the author:', error.message); // Log the error for debugging
        return res.status(500).json({ message: 'Error following the author', error: error.message });
    }
};


module.exports.getFollower =  async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'user._id');
        res.json({ followers: user.followers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller function to render the profile page
// module.exports.getProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id).populate('followers');
//         const isFollowing = user.followers.some(follower => follower._id.equals(req.user._id));
        
//         res.render('profile', {
//             user,
//             isFollowing
//         });
//     } catch (err) {
//         console.error('Error fetching profile:', err);
//         res.status(500).json({ message: 'Server error' });
//     }
// };
