import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Calendar, MoveRight } from "lucide-react";

function Kanban() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state for creating new task
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
    const [newTaskStatus, setNewTaskStatus] = useState("TODO");

    const columns = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

    const fetchTasks = async () => {
        try {
            const res = await axios.get("/api/v1/tasks");
            if (res.data.success) {
                setTasks(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // HTML5 Drag and Drop Handlers
    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Required to allow dropping
    };

    const handleDrop = async (e, targetStatus) => {
        const taskId = e.dataTransfer.getData("taskId");
        if (!taskId) return;

        // Optimistically update status on frontend
        setTasks(prev => prev.map(task => 
            task._id === taskId ? { ...task, status: targetStatus } : task
        ));

        try {
            await axios.patch(`/api/v1/tasks/${taskId}/status`, { status: targetStatus });
        } catch (error) {
            console.error("Error updating task status:", error);
            fetchTasks(); // Rollback on failure
        }
    };

    // Create a new task card
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const res = await axios.post("/api/v1/tasks", {
                title: newTaskTitle,
                description: newTaskDesc,
                priority: newTaskPriority,
                status: newTaskStatus
            });

            if (res.data.success) {
                setTasks(prev => [res.data.data, ...prev]);
                // Reset form
                setNewTaskTitle("");
                setNewTaskDesc("");
                setNewTaskPriority("MEDIUM");
                setNewTaskStatus("TODO");
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    // Delete a task card
    const handleDeleteTask = async (taskId) => {
        // Optimistic delete
        setTasks(prev => prev.filter(task => task._id !== taskId));
        try {
            await axios.delete(`/api/v1/tasks/${taskId}`);
        } catch (error) {
            console.error("Error deleting task:", error);
            fetchTasks(); // Rollback
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header controls */}
            <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm m-0">
                    Manage your video pipeline cards. Drag and drop cards across columns to update production phases.
                </p>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    New Card
                </button>
            </div>

            {/* Columns list container */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {columns.map(col => {
                    const colTasks = tasks.filter(t => t.status === col);
                    return (
                        <div
                            key={col}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col)}
                            className="bg-[#14121a] border border-[#201d2a] rounded-2xl flex flex-col min-h-[500px]"
                        >
                            {/* Column Header */}
                            <div className="p-4 border-b border-[#201d2a] flex justify-between items-center bg-[#1c1924]/30 rounded-t-2xl">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                    {col.replace("_", " ")}
                                </span>
                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                    {colTasks.length}
                                </span>
                            </div>

                            {/* Card deck */}
                            <div className="p-3 flex-1 overflow-y-auto space-y-3.5">
                                {colTasks.map(task => (
                                    <div
                                        key={task._id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task._id)}
                                        className="bg-[#1c1924] border border-[#2c2838] p-4 rounded-xl shadow-sm hover:border-indigo-500/50 cursor-grab active:cursor-grabbing transition-all duration-150 group"
                                    >
                                        <div className="flex justify-between items-start mb-2.5">
                                            {/* Priority Badge */}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                task.priority === "HIGH" 
                                                    ? "bg-rose-500/10 text-rose-400"
                                                    : task.priority === "MEDIUM"
                                                    ? "bg-amber-500/10 text-amber-400"
                                                    : "bg-blue-500/10 text-blue-400"
                                            }`}>
                                                {task.priority}
                                            </span>
                                            {/* Delete card */}
                                            <button
                                                onClick={() => handleDeleteTask(task._id)}
                                                className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <h3 className="text-sm font-bold text-white mb-1.5 m-0 line-clamp-1">
                                            {task.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 line-clamp-2 m-0 mb-3.5">
                                            {task.description || "No description provided."}
                                        </p>

                                        {/* Deadline Info */}
                                        {task.deadline && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold border-t border-[#2c2838] pt-2.5">
                                                <Calendar className="w-3 h-3 text-indigo-400" />
                                                <span>
                                                    Due {new Date(task.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create Task Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form
                        onSubmit={handleCreateTask}
                        className="bg-[#14121a] border border-[#2c2838] rounded-2xl w-full max-w-md p-6 space-y-4"
                    >
                        <h2 className="text-lg font-black text-white m-0 tracking-tight">
                            Add Production Card
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                    Card Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    className="w-full bg-[#1c1924] border border-[#2c2838] px-4 py-2.5 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newTaskDesc}
                                    onChange={(e) => setNewTaskDesc(e.target.value)}
                                    className="w-full bg-[#1c1924] border border-[#2c2838] px-4 py-2.5 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-indigo-500 min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={newTaskPriority}
                                        onChange={(e) => setNewTaskPriority(e.target.value)}
                                        className="w-full bg-[#1c1924] border border-[#2c2838] px-4 py-2.5 rounded-xl text-white text-sm font-semibold focus:outline-none"
                                    >
                                        <option value="LOW">LOW</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HIGH">HIGH</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                        Status Column
                                    </label>
                                    <select
                                        value={newTaskStatus}
                                        onChange={(e) => setNewTaskStatus(e.target.value)}
                                        className="w-full bg-[#1c1924] border border-[#2c2838] px-4 py-2.5 rounded-xl text-white text-sm font-semibold focus:outline-none"
                                    >
                                        <option value="TODO">TODO</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="REVIEW">REVIEW</option>
                                        <option value="DONE">DONE</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-200 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                            >
                                Create Card
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Kanban;
