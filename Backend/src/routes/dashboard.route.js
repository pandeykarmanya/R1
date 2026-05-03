import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "member"), asyncHandler(getDashboardStats));

export default router;
