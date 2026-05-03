import User from "../models/User.model.js";

const getUsers = async (req, res) => {
    const users = await User.find({ isActive: true })
        .select("name email role isActive createdAt")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: users.length,
        users
    });
};

const getMembers = async (req, res) => {
    const members = await User.find({ role: "member", isActive: true })
        .select("name email role")
        .sort({ name: 1 });

    res.json({
        success: true,
        count: members.length,
        members
    });
};

export { getMembers, getUsers };
