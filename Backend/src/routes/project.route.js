import express from 'express';
import {
    addProjectMember,
    createProject,
    deleteProject,
    getProjectById,
    getProjects,
    removeProjectMember,
    updateProject
} from '../controllers/project.controller.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { 
    authorize, 
    protect 
} from '../middleware/auth.middleware.js';

const router = express.Router();

router
    .route('/')
    .get(protect, authorize('admin', 'member'), asyncHandler(getProjects))
    .post(protect, authorize('admin'), asyncHandler(createProject));

router
    .route('/:id')
    .get(protect, authorize('admin', 'member'), asyncHandler(getProjectById))
    .put(protect, authorize('admin'), asyncHandler(updateProject))
    .delete(protect, authorize('admin'), asyncHandler(deleteProject));

router.post(
    '/:id/members',
    protect,
    authorize('admin'),
    asyncHandler(addProjectMember)
);

router.delete(
    '/:id/members/:memberId',
    protect,
    authorize('admin'),
    asyncHandler(removeProjectMember)
);

export default router;
