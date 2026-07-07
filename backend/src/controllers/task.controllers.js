import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Task: Create a new Kanban task card.
 * 
 * TODO:
 * 1. Extract fields: title, description, status, priority, assignedTo, videoRef, deadline.
 * 2. Validate that title is provided.
 * 3. Create the task in the database.
 * 4. Respond with 201.
 */
const createTask = asyncHandler(async (req, res) => {
    // Your code here...
    const {title, description, status, priority, assignedTo, videoRef, deadline} = req.body;
    if (!title){
        throw new ApiError(400, "Title is required");
    }
    const task = await Task.create({
        title,
        description,
        status,
        priority,
        assignedTo,
        videoRef,
        deadline,
    });

    return res
        .status(201)
        .json(new ApiResponse(
            201, 
            task, 
            "Task created successfully"
        ));
});

/**
 * Task: Retrieve tasks matching filters (e.g. status, priority, or assignee).
 * 
 * TODO:
 * 1. Fetch all tasks assigned to the current user or created by the user.
 * 2. Optionally support filtering by `status` or `priority` from req.query.
 * 3. Respond with task list.
 */
const getTasks = asyncHandler(async (req, res) => {
    // Your code here...
    const {status, priority} = req.query;
    const query = {};
    if(status) query.status = status;
    if(priority) query.priority = priority;

    const tasks = await Task.find(query);
    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            tasks, 
            "Tasks fetched successfully"
        ));
});

/**
 * Task: Update task details.
 * 
 * TODO:
 * 1. Retrieve taskId from req.params.
 * 2. Extract fields: title, description, status, priority, deadline.
 * 3. Find and update the task.
 * 4. Respond with updated task.
 */
const updateTask = asyncHandler(async (req, res) => {
    // Your code here...
    const {taskId} = req.params;
    const {title, description, status, priority, deadline} = req.body;

    const task = await Task.findByIdAndUpdate(taskId, {
        title,
        description,
        status,
        priority,
        deadline,
    }, {new: true});
    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            task, 
            "Task updated successfully"
        ));
});

/**
 * Task: Change the Kanban column status of a task (drag & drop helper).
 * 
 * TODO:
 * 1. Retrieve taskId from req.params.
 * 2. Extract `status` from req.body (validate it belongs to the enum: TODO, IN_PROGRESS, REVIEW, DONE).
 * 3. Update task status and save.
 * 4. Respond with updated task.
 */
const changeTaskStatus = asyncHandler(async (req, res) => {
    // Your code here...
    const {taskId} = req.params;
    const {status} = req.body;
    const task = await Task.findByIdAndUpdate(taskId, {
        status,
    }, {new: true});
    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            task, 
            "Task status changed successfully"
        ));
});

/**
 * Task: Delete a task card.
 * 
 * TODO:
 * 1. Retrieve taskId from req.params.
 * 2. Delete task from database.
 * 3. Respond with success.
 */
const deleteTask = asyncHandler(async (req, res) => {
    // Your code here...
    const {taskId} = req.params;
    const task = await Task.findByIdAndDelete(taskId);
    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            task, 
            "Task deleted successfully"
        ));
});

export {
    createTask,
    getTasks,
    updateTask,
    changeTaskStatus,
    deleteTask
};
