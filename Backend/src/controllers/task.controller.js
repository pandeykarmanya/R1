import mongoose from "mongoose";
import Project from "../models/Project.model.js";
import Task from "../models/Task.model.js";
import User from "../models/User.model.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const allowedStatuses = ["todo", "in-progress", "done"];
const allowedPriorities = ["low", "medium", "high"];

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const populateTask = (query) =>
    query
        .populate("project", "name")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role");

const canViewTask = (task, user) => {
    if (user.role === "admin") return true;

    const assignedId = task.assignedTo._id
        ? task.assignedTo._id.toString()
        : task.assignedTo.toString();

    return assignedId === user._id.toString();
};

const getTasks = async (req, res) => {
    const filter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const { page, limit, skip } = getPagination(req.query);

    if (req.query.project) {
        if (!isValidId(req.query.project)) {
            return res.status(400).json({ success: false, message: "Invalid project id" });
        }

        filter.project = req.query.project;
    }

    if (req.query.status) {
        if (!allowedStatuses.includes(req.query.status)) {
            return res.status(400).json({ success: false, message: "Invalid task status" });
        }

        filter.status = req.query.status;
    }

    const [tasks, totalTasks] = await Promise.all([
        populateTask(Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
        Task.countDocuments(filter)
    ]);

    res.json({
        success: true,
        count: tasks.length,
        totalTasks,
        page,
        totalPages: Math.ceil(totalTasks / limit) || 1,
        tasks
    });
};

const createTask = async (req, res) => {
    const {
        title,
        description = "",
        project,
        assignedTo,
        status = "todo",
        priority = "medium",
        dueDate
    } = req.body;

    if (!title || title.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Task title must be at least 3 characters"
        });
    }

    if (!isValidId(project) || !isValidId(assignedTo)) {
        return res.status(400).json({
            success: false,
            message: "Valid project and assignee are required"
        });
    }

    if (!allowedStatuses.includes(status) || !allowedPriorities.includes(priority)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status or priority"
        });
    }

    const existingProject = await Project.findById(project);

    if (!existingProject) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    const assignee = await User.findById(assignedTo);

    if (!assignee || !assignee.isActive) {
        return res.status(404).json({ success: false, message: "Assignee not found" });
    }

    const isProjectMember = existingProject.members.some(
        (member) => member.toString() === assignedTo
    );

    if (!isProjectMember) {
        return res.status(400).json({
            success: false,
            message: "Assignee must be a member of the project"
        });
    }

    const task = await Task.create({
        title,
        description,
        project,
        assignedTo,
        createdBy: req.user._id,
        status,
        priority,
        dueDate
    });

    const populatedTask = await populateTask(Task.findById(task._id));

    res.status(201).json({
        success: true,
        task: populatedTask
    });
};

const getTaskById = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid task id" });
    }

    const task = await populateTask(Task.findById(req.params.id));

    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!canViewTask(task, req.user)) {
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({
        success: true,
        task
    });
};

const updateTask = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid task id" });
    }

    const allowedUpdates = ["title", "description", "assignedTo", "status", "priority", "dueDate"];
    const updates = {};

    allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    if (updates.title !== undefined && updates.title.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Task title must be at least 3 characters"
        });
    }

    if (updates.status !== undefined && !allowedStatuses.includes(updates.status)) {
        return res.status(400).json({ success: false, message: "Invalid task status" });
    }

    if (updates.priority !== undefined && !allowedPriorities.includes(updates.priority)) {
        return res.status(400).json({ success: false, message: "Invalid task priority" });
    }

    if (updates.assignedTo !== undefined && !isValidId(updates.assignedTo)) {
        return res.status(400).json({ success: false, message: "Invalid assignee id" });
    }

    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (updates.assignedTo !== undefined) {
        const project = await Project.findById(existingTask.project);
        const assignee = await User.findById(updates.assignedTo);

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        if (!assignee || !assignee.isActive) {
            return res.status(404).json({ success: false, message: "Assignee not found" });
        }

        const isProjectMember = project.members.some(
            (member) => member.toString() === updates.assignedTo
        );

        if (!isProjectMember) {
            return res.status(400).json({
                success: false,
                message: "Assignee must be a member of the project"
            });
        }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
    });

    const populatedTask = await populateTask(Task.findById(task._id));

    res.json({
        success: true,
        task: populatedTask
    });
};

const deleteTask = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid task id" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({
        success: true,
        message: "Task deleted successfully"
    });
};

const updateTaskStatus = async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid task id" });
    }

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid task status" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    const isAssignedMember = task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role !== "admin" && !isAssignedMember) {
        return res.status(403).json({
            success: false,
            message: "Members can update only their own assigned task status"
        });
    }

    task.status = status;
    await task.save();

    const populatedTask = await populateTask(Task.findById(task._id));

    res.json({
        success: true,
        task: populatedTask
    });
};

export {
    createTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateTask,
    updateTaskStatus
};
