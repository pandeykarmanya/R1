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
    .get(protect, authorize('admin', 'member'), notImplemented('List tasks'))
    .post(protect, authorize('admin'), notImplemented('Create task'));

router
    .route('/:id')
    .get(protect, authorize('admin', 'member'), notImplemented('Get task'))
    .put(protect, authorize('admin'), notImplemented('Update task'))
    .delete(protect, authorize('admin'), notImplemented('Delete task'));

router.patch(
    '/:id/status',
    protect,
    authorize('admin', 'member'),
    notImplemented('Update task status')
);

export default router;
