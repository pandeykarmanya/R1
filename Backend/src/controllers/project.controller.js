import mongoose from "mongoose";
import Project from "../models/Project.model.js";
import Task from "../models/Task.model.js";
import User from "../models/User.model.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const populateProject = (query) =>
    query
        .populate("createdBy", "name email role")
        .populate("members", "name email role");

// Check if user can view project
const canViewProject = (project, user) => {
    if (user.role === "admin") return true;

    return project.members.some((member) => {
        const memberId = member._id ? member._id.toString() : member.toString();
        return memberId === user._id.toString();
    });
};

const getProjects = async (req, res) => {
    const filter =
        req.user.role === "admin"
            ? {}
            : { members: req.user._id };
    const { page, limit, skip } = getPagination(req.query);

    const [projects, totalProjects] = await Promise.all([
        populateProject(Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
        Project.countDocuments(filter)
    ]);

    res.json({
        success: true,
        count: projects.length,
        totalProjects,
        page,
        totalPages: Math.ceil(totalProjects / limit) || 1,
        projects
    });
};

// Create a new project
const createProject = async (req, res) => {
    const { name, description = "", members = [] } = req.body;

    if (!name || name.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Project name must be at least 3 characters"
        });
    }

    if (!Array.isArray(members)) {
        return res.status(400).json({
            success: false,
            message: "Members must be an array of user ids"
        });
    }

    const memberIds = [...new Set([req.user._id.toString(), ...members])];

    const hasInvalidMemberId = memberIds.some((memberId) => !isValidId(memberId));

    if (hasInvalidMemberId) {
        return res.status(400).json({
            success: false,
            message: "One or more member ids are invalid"
        });
    }

    const validMembers = await User.find({
        _id: { $in: memberIds },
        isActive: true
    }).select("_id");

    if (validMembers.length !== memberIds.length) {
        return res.status(400).json({
            success: false,
            message: "One or more project members are invalid"
        });
    }

    const project = await Project.create({
        name,
        description,
        createdBy: req.user._id,
        members: memberIds
    });

    const populatedProject = await populateProject(Project.findById(project._id));

    res.status(201).json({
        success: true,
        project: populatedProject
    });
};

// Get project by id
const getProjectById = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await populateProject(Project.findById(req.params.id));

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!canViewProject(project, req.user)) {
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({
        success: true,
        project
    });
};

// Update project
const updateProject = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const { name, description } = req.body;

    if (name !== undefined && name.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Project name must be at least 3 characters"
        });
    }

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
    });

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    const populatedProject = await populateProject(Project.findById(project._id));

    res.json({
        success: true,
        project: populatedProject
    });
};

// Delete project
const deleteProject = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    await Task.deleteMany({ project: req.params.id });

    res.json({
        success: true,
        message: "Project deleted successfully"
    });
};

// Add member to project
const addProjectMember = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid project id" });
    }

    const { memberId } = req.body;

    if (!isValidId(memberId)) {
        return res.status(400).json({ success: false, message: "Invalid member id" });
    }

    const member = await User.findById(memberId);

    if (!member || !member.isActive) {
        return res.status(404).json({ success: false, message: "Member not found" });
    }

    const project = await Project.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { members: memberId } },
        { new: true, runValidators: true }
    );

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    const populatedProject = await populateProject(Project.findById(project._id));

    res.json({
        success: true,
        project: populatedProject
    });
};

// Remove member from project
const removeProjectMember = async (req, res) => {
    if (!isValidId(req.params.id) || !isValidId(req.params.memberId)) {
        return res.status(400).json({ success: false, message: "Invalid project or member id" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.createdBy.toString() === req.params.memberId) {
        return res.status(400).json({
            success: false,
            message: "Project creator cannot be removed from the project"
        });
    }

    project.members = project.members.filter(
        (member) => member.toString() !== req.params.memberId
    );

    await project.save();

    await Task.updateMany(
        {
            project: req.params.id,
            assignedTo: req.params.memberId,
            status: { $ne: "done" }
        },
        { assignedTo: project.createdBy }
    );

    const populatedProject = await populateProject(Project.findById(project._id));

    res.json({
        success: true,
        message: "Member removed from project",
        project: populatedProject
    });
};

export {
    addProjectMember,
    createProject,
    deleteProject,
    getProjectById,
    getProjects,
    removeProjectMember,
    updateProject
};
