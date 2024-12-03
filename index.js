const express = require("express")
const app = express()
const path = require('path');

const connectDB = require('./config/db')
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const userRouter = require("./routes/userRouter")
const postRouter = require ("./routes/postRouter");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();

connectDB();

const Post = require ("./models/post");

app.get("/", async (req, res) => {
    try {
        const blogs = await Post.find(); // Fetch blogs from the database
        res.render("index", { blogs });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.use("/", userRouter);
app.use("/posts", postRouter);
app.use('/uploads', express.static('uploads'));

app.get('/blogs', async (req, res) => {
    const category = req.query.category || 'All'; // Default to 'All'
    let blogs;

    // Fetch blogs based on category
    if (category === 'All') {
        blogs = await Post.find(); // Fetch all blogs
    } else {
        blogs = await Post.find({ category: category }); // Fetch blogs by category
    }

    res.render('index', { blogs }); // Render your view file (e.g., 'blogs.ejs') with the blogs
});

app.get('/posts/:postId/comments', async (req, res) => {
    const postId = req.params.postId;
    const offset = parseInt(req.query.offset, 10) || 0;
    const limit = 5; // Load 5 comments at a time

    const post = await Post.findById(postId);
    const totalComments = post.comments.length;
    const comments = post.comments.slice(offset, offset + limit);

    const hasMoreComments = (offset + limit) < totalComments;

    res.json({
        comments,
        hasMoreComments
    });
});

app.use("/", userRouter);


app.listen(8080, () => {
    console.log("App is listening to port 8080")
})
