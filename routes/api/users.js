const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const { validationResult } = require("express-validator");

// Load input validation
const {
  validateSignupInput,
  validateLoginInput,
} = require("../../validation/auth");

// Load User model
const User = require("../../models/User");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", validateSignupInput(), async (req, res) => {
  // Check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Formatting errors to return object instead of an array
    const formattedErrors = errors.array().reduce((acc, current) => {
      acc[current["param"]] = current.msg;
      return acc;
    }, {});
    if (req.body.password !== req.body.password2) {
      formattedErrors.password2 = "Passwords do not match";
    }
    return res.status(400).json(formattedErrors);
  }

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ email: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        name: user.name,
      },
    };

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", validateLoginInput(), async (req, res) => {
  // Check Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Formatting errors to return object instead of an array
    const formattedErrors = errors.array().reduce((acc, current) => {
      acc[current["param"]] = current.msg;
      return acc;
    }, {});
    return res.status(400).json(formattedErrors);
  }

  const { email, password } = req.body;

  // Find user by email
  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ auth: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ auth: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        name: user.name,
      },
    };

 } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    GET api/users/current
// @desc     Get user by token
// @access   Private
router.get("/current", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
