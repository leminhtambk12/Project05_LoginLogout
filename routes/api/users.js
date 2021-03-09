const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../config/keys").secret;
const User = require("../../model/User");

//POST request for register
router.post("/register", (req, res) => {
    let { name, username, email, password, confirm_password } = req.body;
    if (password !== confirm_password) {
        return res.status(400).json({
            msg: "Password does not match.",
        });
    }
    //Check for the unique username
    User.findOne({ username: username }).then((user) => {
        if (user) {
            return res.status(400).json({
                msg: "Username is already taken.",
            });
        }
    });
    //Check for the unique email
    User.findOne({ email: email }).then((user) => {
        if (user) {
            return res.status(400).json({
                msg: "Email is already registered.Did you forgot your password",
            });
        }
    });
    //The data is valid and now we can register the user
    let newUser = new User({
        name,
        username,
        password,
        email,
    });
    //Hash the password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save().then((user) => {
                return res.status(201).json({
                    success: true,
                    msg: "Hurry! User is now registered.",
                });
            });
        });
    });
});
//POST request for login
router.post("/login", (req, res) => {
    User.findOne({ username: req.body.username }).then((user) => {
        if (!user) {
            return res.status(404).json({
                msg: "Username is not found",
                success: false,
            });
        }
        //if there is user now we compare to password
        bcrypt.compare(req.body.password, user.password).then((isMatch) => {
            if (isMatch) {
                //User's password is correct and we need to send the Json token for that user
                const payload = {
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                };
                jwt.sign(payload, key, { expiresIn: 604800 }, (err, token) => {
                    res.status(200).json({
                        success: true,
                        token: `Bearer ${token}`,
                        user: user,
                        msg: "Hurry! You are now logged in ",
                    });
                });
            } else {
                return res.status(404).json({
                    msg: "Incorrect password",
                    success: false,
                });
            }
        });
    });
});
//GET method for get profile
router.get(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        return res.json({
            user: req.user,
        });
    }
);
module.exports = router;