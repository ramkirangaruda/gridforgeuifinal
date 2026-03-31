import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const TASK_HIDE_AFTER_MS = 6000;

const getTaskKey = (task) => {
    return task?.task_id ?? task?.id ?? "";
};

const getTaskTimestampMs = (task) => {
    const candidates = [
        task?.updated_at,
        task?.completed_at,
        task?.finished_at,
        task?.ended_at,
        task?.end_time,
        task?.started_at,
        task?.start_time,
        task?.created_at,
        task?.submitted_at,
        task?.timestamp,
        task?.time,
        task?.ts,
    ];

    for (const value of candidates) {
        if (value === undefined || value === null) continue;

        if (typeof value === "number" && Number.isFinite(value)) {
            // Heuristic: seconds vs milliseconds
            if (value > 1e12) return value;
            if (value > 1e9) return value * 1000;
            continue;
        }

        if (typeof value === "string") {
            const parsed = Date.parse(value);
            if (!Number.isNaN(parsed)) return parsed;

            const asNumber = Number(value);
            if (Number.isFinite(asNumber)) {
                if (asNumber > 1e12) return asNumber;
                if (asNumber > 1e9) return asNumber * 1000;
            }
        }
    }

    return undefined;
};

const isFailedTask = (task) => {
    const status = typeof task?.status === "string" ? task.status.toLowerCase() : "";
    return status === "failed" || status === "error" || status === "errored";
};

const normalizeTasks = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.tasks)) return data.tasks;
    if (data.task_id || data.id) return [data];

    // If the API returns a map/object of tasks keyed by id
    const values = Object.values(data);
    if (values.length && values.every((v) => v && typeof v === "object")) return values;
    return [];
};

const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
};

const TaskCard = ({ task }) => {
    const statusClass = statusColors[task.status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
    const isGpuTask = task.requires_gpu === true;
    const outputText = useMemo(() => {
        const output = task?.output ?? task?.result ?? task?.final_output ?? task?.stdout ?? task?.message;
        if (output === undefined || output === null) return "";
        if (typeof output === "string") return output;
        try {
            return JSON.stringify(output, null, 2);
        } catch {
            return String(output);
        }
    }, [task]);

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
                    <code>{outputText || "(no output yet)"}</code>
                </pre>
            </div>
        </motion.div>
    );
};


function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");
    const [taskHideAt, setTaskHideAt] = useState({});

    const fetchTasks = useCallback(async () => {
        try {
            const res = await axios.get("http://172.20.10.3:5050/results");
            const normalized = normalizeTasks(res.data);
            const now = Date.now();
            const keys = new Set(normalized.map(getTaskKey).filter(Boolean));

            setTasks(normalized);
            setTaskHideAt((prev) => {
                const next = { ...prev };

                for (const task of normalized) {
                    const key = getTaskKey(task);
                    if (!key) continue;

                    if (task.status === "processing") {
                        delete next[key];
                        continue;
                    }

                    if (!next[key] || next[key] < now) {
                        next[key] = now + TASK_HIDE_AFTER_MS;
                    }
                }

                // Clean up entries for tasks that disappeared from the API
                for (const key of Object.keys(next)) {
                    if (!keys.has(key)) delete next[key];
                }

                return next;
            });
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load results");
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 2000);
        return () => clearInterval(interval);
    }, [fetchTasks]);

    const summary = useMemo(() => {
        const pending = tasks.filter((t) => t.status === "pending").length;
        const processingTasks = tasks.filter((t) => t.status === "processing");
        const processing = processingTasks.length;
        const completed = tasks.filter((t) => t.status === "completed").length;
        const activeWorkers = new Set(
            processingTasks
                .map((t) => t.worker_id)
                .filter((w) => w !== undefined && w !== null && String(w).trim() !== "")
        ).size;

        return { activeWorkers, pending, processing, completed };
    }, [tasks]);

    const failedTasks = useMemo(() => {
        return tasks
            .filter(isFailedTask)
            .map((task, apiIndex) => ({ task, apiIndex, ts: getTaskTimestampMs(task) }))
            .sort((a, b) => {
                const aKey = a.ts ?? a.apiIndex;
                const bKey = b.ts ?? b.apiIndex;
                return bKey - aKey;
            })
            .map((x) => x.task);
    }, [tasks]);

    const visibleTasks = useMemo(() => {
        const now = Date.now();
        const filtered = tasks.filter((task) => {
            if (isFailedTask(task)) return false;
            const key = getTaskKey(task);
            if (task.status === "processing") return true;
            if (!key) return false;
            return taskHideAt[key] !== undefined && taskHideAt[key] > now;
        });

        // Sort by recency (latest executed first). Prefer timestamp fields when available.
        return filtered
            .map((task, apiIndex) => ({ task, apiIndex, ts: getTaskTimestampMs(task) }))
            .sort((a, b) => {
                const aKey = a.ts ?? a.apiIndex;
                const bKey = b.ts ?? b.apiIndex;
                return bKey - aKey;
            })
            .map((x) => x.task);
    }, [tasks, taskHideAt]);

    const primaryTasks = useMemo(() => {
        const top = visibleTasks.slice(0, 2);
        // Within the top set, keep processing tasks first (still newest-first overall).
        return top
            .map((task, i) => ({ task, i }))
            .sort((a, b) => {
                const aRank = a.task.status === "processing" ? 0 : 1;
                const bRank = b.task.status === "processing" ? 0 : 1;
                if (aRank !== bRank) return aRank - bRank;
                return a.i - b.i;
            })
            .map((x) => x.task);
    }, [visibleTasks]);
    const overflowTasks = useMemo(() => visibleTasks.slice(2), [visibleTasks]);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-300">Task Dashboard</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/60">Active workers</div>
                    <div className="text-xl font-bold text-white">{summary.activeWorkers}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/60">Pending</div>
                    <div className="text-xl font-bold text-white">{summary.pending}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/60">Processing</div>
                    <div className="text-xl font-bold text-white">{summary.processing}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/60">Completed</div>
                    <div className="text-xl font-bold text-white">{summary.completed}</div>
                </div>
            </div>

            {error ? (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                </div>
            ) : null}
            <AnimatePresence>
                {primaryTasks.length > 0 ? (
                    primaryTasks.map((task) => (
                        <TaskCard key={task.task_id ?? task.id ?? JSON.stringify(task)} task={task} />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No tasks yet. Submit one to get started!
                    </div>
                )}
            </AnimatePresence>

            {overflowTasks.length > 0 ? (
                <details className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <summary className="cursor-pointer select-none text-sm font-semibold text-white/80 hover:text-white">
                        Show older tasks ({overflowTasks.length})
                    </summary>
                    <div className="mt-4 space-y-4">
                        {overflowTasks.map((task) => (
                            <TaskCard key={task.task_id ?? task.id ?? JSON.stringify(task)} task={task} />
                        ))}
                    </div>
                </details>
            ) : null}

            {failedTasks.length > 0 ? (
                <details className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                    <summary className="cursor-pointer select-none text-sm font-semibold text-red-200 hover:text-red-100">
                        Failed tasks ({failedTasks.length})
                    </summary>
                    <div className="mt-4 space-y-4">
                        {failedTasks.map((task) => (
                            <TaskCard key={task.task_id ?? task.id ?? JSON.stringify(task)} task={task} />
                        ))}
                    </div>
                </details>
            ) : null}
        </div>
    );
}

export default Dashboard;