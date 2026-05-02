import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

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
    const UserExists = await User.findOne({ email });

    if (UserExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
        name,
        email,
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
    const user = await User.findOne({ email });

    if (!user) {
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
