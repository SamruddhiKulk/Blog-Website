const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post('/createprofile', async (req, res) => {
    let { email, password, username, name, age } = req.body;

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
            age,
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
        req.user = user;
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;