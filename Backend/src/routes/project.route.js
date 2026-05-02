import express from 'express';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

const notImplemented = (feature) => (_req, res) => {
    res.status(501).json({
        success: false,
        message: `${feature} controller is not implemented yet`
    });
};

router
    .route('/')
    .get(protect, authorize('admin', 'member'), notImplemented('List projects'))
    .post(protect, authorize('admin'), notImplemented('Create project'));

router
    .route('/:id')
    .get(protect, authorize('admin', 'member'), notImplemented('Get project'))
    .put(protect, authorize('admin'), notImplemented('Update project'))
    .delete(protect, authorize('admin'), notImplemented('Delete project'));

router.post(
    '/:id/members',
    protect,
    authorize('admin'),
    notImplemented('Add project member')
);

export default router;
