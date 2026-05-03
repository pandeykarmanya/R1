import express from 'express';
import {
    createTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateTask,
    updateTaskStatus
} from '../controllers/task.controller.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router
    .route('/')
    .get(protect, authorize('admin', 'member'), asyncHandler(getTasks))
    .post(protect, authorize('admin'), asyncHandler(createTask));

router
    .route('/:id')
    .get(protect, authorize('admin', 'member'), asyncHandler(getTaskById))
    .put(protect, authorize('admin'), asyncHandler(updateTask))
    .delete(protect, authorize('admin'), asyncHandler(deleteTask));

router.patch(
    '/:id/status',
    protect,
    authorize('admin', 'member'),
    asyncHandler(updateTaskStatus)
);

export default router;
