import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import dashboardRoutes from './routes/dashboard.route.js';
import projectRoutes from './routes/project.route.js';
import taskRoutes from './routes/task.route.js';
import userRoutes from './routes/user.route.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
    res.send("MY SERVER IS RUNNING");
});

app.use(notFound);
app.use(errorHandler);

export default app;
