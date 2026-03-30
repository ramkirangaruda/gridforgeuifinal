import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
};

const TaskCard = ({ task }) => {
    const statusClass = statusColors[task.status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
    const isGpuTask = task.requires_gpu === true;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-gray-700"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusClass}`}>
                        {task.status}
                        {task.status === "processing" && <span className="animate-pulse"> •</span>}
                    </span>

                    <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${isGpuTask ? "bg-purple-500/20 text-purple-300" : "bg-gray-700 text-gray-300"}`}
                    >
                        {isGpuTask ? "GPU Task" : "CPU Task"}
                    </span>
                </div>

                <div className="text-xs text-gray-400 font-mono break-all text-right">
                    {task.task_id}
                </div>
            </div>

            <div className="mt-3 text-sm text-gray-300">
                <span className="text-gray-400 font-semibold">Worker:</span> {task.worker_id}
            </div>

            <div className="mt-4">
                <p className="text-sm font-bold text-gray-400 mb-2">Output:</p>
                <pre className="bg-black rounded-md p-4 text-sm text-green-400 font-mono overflow-auto max-h-60">
                    <code>{task.output}</code>
                </pre>
            </div>
        </motion.div>
    );
};


function Dashboard() {
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            const res = await axios.get("http://172.20.10.3:5050/results");
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-300">Task Dashboard</h2>
            <AnimatePresence>
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskCard key={task.task_id} task={task} />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No tasks yet. Submit one to get started!
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Dashboard;