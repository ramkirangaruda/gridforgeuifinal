import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const ToggleSwitch = ({ enabled, setEnabled }) => {
  return (
    <motion.div
      onClick={() => setEnabled(!enabled)}
      className="relative cursor-pointer"
      whileHover={{ scale: 1.05 }}
    >
      {/* Background */}
      <motion.div
        animate={{
          backgroundColor: enabled ? "#06B6D4" : "#E5E7EB",
          boxShadow: enabled
            ? "0 0 20px rgba(6, 182, 212, 0.5)"
            : "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
        className="w-16 h-8 rounded-full p-1 transition-all duration-300"
      >
        {/* Inner Circle */}
        <motion.div
          animate={{
            x: enabled ? 32 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
          className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
        >
          <motion.span
            animate={{
              opacity: enabled ? 1 : 0,
              scale: enabled ? 1 : 0.5,
            }}
            className="text-cyan-400 text-sm font-bold"
          >
            {enabled ? "✓" : ""}
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Label */}
      <motion.span
        animate={{
          color: enabled ? "#06B6D4" : "#9CA3AF",
        }}
        className="absolute right-0 top-10 text-xs font-semibold mt-1 whitespace-nowrap"
      >
        {enabled ? "Enabled" : "Disabled"}
      </motion.span>
    </motion.div>
  );
};

const FormError = ({ message }) =>
  message ? (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded"
    >
      {message}
    </motion.div>
  ) : null;

const SuccessMessage = ({ show }) =>
  show ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded flex items-center gap-2"
    >
      ✓ Task submitted successfully!
    </motion.div>
  ) : null;

const SubmitTask = () => {
  const [code, setCode] = useState("");
  const [gpu, setGpu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submitTask = async () => {
    // Validation
    if (!code.trim()) {
      setError("Please enter code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://172.20.10.3:5050/submit-task", {
        code: code,
        requires_gpu: gpu,
      });

      setSuccess(true);
      setCode("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden pt-32 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 animate-pulse" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl mx-auto p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl mb-10"
      >
        <h1 className="text-4xl font-bold mb-8 text-white drop-shadow-lg">
          Submit Task
        </h1>

        <SuccessMessage show={success} />
        <FormError message={error} />

        {/* Code Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-white/90 mb-3">
            Code
          </label>
          <motion.textarea
            whileFocus={{ boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 border-2 border-white/30 rounded-lg font-mono text-sm bg-black/40 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
            placeholder="Enter your code here..."
          />
        </div>

        {/* GPU Toggle */}
        <div className="flex items-center justify-between mb-8 bg-white/5 p-4 rounded-lg backdrop-blur border border-white/20">
          <label className="text-sm font-medium text-white/90">
            Requires GPU
          </label>
          <ToggleSwitch enabled={gpu} setEnabled={setGpu} />
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={submitTask}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:shadow-none"
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              ⟳ Submitting...
            </motion.span>
          ) : (
            "Submit Task"
          )}
        </motion.button>

        {/* Info Text */}
        <p className="text-center text-white/60 text-xs mt-4">
          Make sure your code is complete before submitting
        </p>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-white/20"
        >
          <h3 className="text-sm font-semibold text-cyan-400 mb-3">
            Supported Languages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              "Python",
              "JavaScript",
              "Java",
              "C++",
              "C#",
              "Go",
              "Rust",
              "Ruby",
            ].map((lang, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="text-xs text-white/60 bg-white/5 p-2 rounded border border-white/10 text-center"
              >
                {lang}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SubmitTask;
