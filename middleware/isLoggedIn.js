const jwt = require ("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const user = require ("../models/user");


// module.exports = async function (req, res, next) {
//     if(!req.cookies.token) {
//         req.flash("error", "You need to login first");
//         return res.redirect("/");
//     }

//     try {
//         let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
//         let user = await userModel
//           .findOne({email: decoded.email})
//           .select("-password");
//         req.user = user;
//         next();
//     } catch (err) {
//         req.flash("error", "Somethimg went wrong.");
//         res.redirect("/");
//     }
// };

// Middleware to authenticate JWT and set req.user

// module.exports.authenticateToken = async (req, res, next) => {
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });
//     // Token stored in cookies
//     if (!token) {
//         return res.status(401).json({ msg: 'Access denied, please log in' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_KEY);
//         req.user = await user.findById(decoded.userId); // Set the user object to req.user
//         next();
//     } catch (err) {
//         return res.status(401).json({ msg: 'Invalid token' });
//     }
// };


module.exports.authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;  // Get token from cookies
    

    if (!token) {
        return res.status(401).json({ msg: 'Access denied, please log in' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);  // Verify token

        req.user = await user.findById(decoded.userId);  // Fetch user by ID
        if (!req.user) {
            return res.status(401).json({ msg: 'User not found' });
        }

        next();  // Proceed to the next middleware
    } catch (err) {
        console.error("Token verification error:", err);  // Log error
        return res.status(401).json({ msg: 'Invalid token' });
    }
};
