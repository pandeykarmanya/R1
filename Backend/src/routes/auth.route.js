import express from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});
router.get('/admin', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Admin access confirmed'
    });
});

export default router;
