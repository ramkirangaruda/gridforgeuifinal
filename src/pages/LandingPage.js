import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DecryptedText from "../components/DecryptedText";

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 animate-pulse" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 pb-20 pt-32"
      >
        {/* Main Title with DecryptedText - Hover Animation */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
            <DecryptedText
              text="GridForge"
              speed={80}
              maxIterations={15}
              sequential
              revealDirection="center"
              animateOn="hover"
              useOriginalCharsOnly={true}
              className="text-transparent"
              encryptedClassName="text-cyan-400/70"
            />
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light">
            Distributed Computing Platform
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          variants={itemVariants}
          className="max-w-2xl text-center mb-12"
        >
          <p className="text-lg text-white/70 leading-relaxed backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-cyan-400/20">
            Submit and execute your computational tasks across our distributed
            network. Leverage GPU acceleration and parallel processing for
            maximum performance.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mb-12"
        >
          {[
            {
              icon: "⚡",
              title: "Fast Processing",
              description: "Execute tasks at lightning speed",
            },
            {
              icon: "🚀",
              title: "GPU Acceleration",
              description: "Optional GPU support for compute tasks",
            },
            {
              icon: "🔗",
              title: "Distributed",
              description: "Connected network of powerful nodes",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <Link to="/submit-task">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Get Started →
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid md:grid-cols-3 gap-8 text-center"
        >
          {[
            { number: "1M+", label: "Tasks Processed" },
            { number: "99.9%", label: "Uptime" },
            { number: "10x", label: "Faster Than CPU" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-white/5 border border-cyan-400/20 hover:border-cyan-400/50 transition-all"
            >
              <p className="text-3xl font-bold text-cyan-400">{stat.number}</p>
              <p className="text-white/60 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
