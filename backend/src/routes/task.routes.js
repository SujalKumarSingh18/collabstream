import { Router } from "express";
import {
    createTask,
    getTasks,
    updateTask,
    changeTaskStatus,
    deleteTask
} from "../controllers/task.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Apply JWT verification middleware to all task routes
router.use(verifyJWT);

/**
 * Task: Define routes for Kanban Task Cards.
 * 
 * TODO:
 * 1. Define GET "/" to fetch tasks.
 * 2. Define POST "/" to create a new task.
 * 3. Define PATCH "/:taskId" to update task details.
 * 4. Define PATCH "/:taskId/status" to update task status (moving between Kanban columns).
 * 5. Define DELETE "/:taskId" to delete a task.
 */

// Route: Get/Create tasks
router.route("/").get(getTasks).post(createTask);

// Route: Update/Delete specific task
router.route("/:taskId").patch(updateTask).delete(deleteTask);

// Route: Change status (Kanban column migration)
router.route("/:taskId/status").patch(changeTaskStatus);

export default router;
