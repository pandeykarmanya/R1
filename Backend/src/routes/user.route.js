import express from "express";
import { getMembers, getUsers } from "../controllers/user.controller.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), asyncHandler(getUsers));
router.get("/members", protect, authorize("admin"), asyncHandler(getMembers));

export default router;
