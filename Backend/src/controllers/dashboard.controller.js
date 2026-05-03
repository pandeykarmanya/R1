import Task from "../models/Task.model.js";

const getDashboardStats = async (req, res) => {
    const baseFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const now = new Date();

    const [
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        recentTasks
    ] = await Promise.all([
        Task.countDocuments(baseFilter),
        Task.countDocuments({ ...baseFilter, status: "todo" }),
        Task.countDocuments({ ...baseFilter, status: "in-progress" }),
        Task.countDocuments({ ...baseFilter, status: "done" }),
        Task.countDocuments({
            ...baseFilter,
            status: { $ne: "done" },
            dueDate: { $lt: now }
        }),
        Task.find(baseFilter)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("project", "name")
            .populate("assignedTo", "name email role")
    ]);

    res.json({
        success: true,
        stats: {
            totalTasks,
            todoTasks,
            inProgressTasks,
            completedTasks,
            overdueTasks
        },
        recentTasks
    });
};

export { getDashboardStats };
