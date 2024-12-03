const express = require("express");
const router = express.Router();
const User = require ("../models/user");

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '1h' });

        res.json({ token });
        res.status(200).redirect("/profile");
    } catch (err) {
        res.status(401).json({ msg: 'Something went wrong' });
    }
});

module.exports = router;