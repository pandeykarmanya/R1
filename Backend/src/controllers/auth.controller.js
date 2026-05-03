import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({ 
        id: user._id, 
        email: user.email }, 
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
    );
};

// Register a new user
const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const UserExists = await User.findOne({ email: email.toLowerCase() });

    if (UserExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        password
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user)
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
};

// Login user
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.isActive) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user)
    });
}

export { 
    register, 
    login 
};
