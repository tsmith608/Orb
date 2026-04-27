"use client";

import { motion } from "framer-motion";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col w-full px-6 py-4 space-y-6"
    >
      
      {/* Custody Schedule Card */}
      <motion.div variants={itemVariants} className="w-full relative overflow-hidden rounded-3xl p-6 shadow-lg bg-zinc-900 border border-zinc-800">
        <div className="relative z-10 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold text-xl">Custody Schedule</h2>
            <span className="text-xs font-medium text-cyan-400 bg-cyan-900/50 px-3 py-1 rounded-full">Your Turn</span>
          </div>
          <p className="text-zinc-400 text-sm mb-4">
            You have the kids from <span className="text-white font-medium">Monday, July 22nd</span> to <span className="text-white font-medium">Sunday, July 28th</span>.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center p-3 bg-zinc-800 rounded-xl">
              <p className="text-zinc-400 text-xs uppercase tracking-wider">Drop-off</p>
              <p className="text-white font-semibold">Sun, July 28 @ 6:00 PM</p>
            </div>
             <div className="flex-1 text-center p-3 bg-zinc-800 rounded-xl">
              <p className="text-zinc-400 text-xs uppercase tracking-wider">Pick-up</p>
              <p className="text-white font-semibold">Mon, July 29 @ 9:00 AM</p>
            </div>
          </div>
           <button className="mt-4 w-full bg-cyan-500 text-black font-bold py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-transform flex justify-center items-center gap-2">
              Request a Swap
            </button>
        </div>
      </motion.div>

      {/* Alimony Payments Card */}
      <motion.div variants={itemVariants} className="w-full relative overflow-hidden rounded-3xl p-6 shadow-lg bg-zinc-900 border border-zinc-800">
        <div className="relative z-10 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold text-xl">Alimony Payments</h2>
            <span className="text-xs font-medium text-rose-400 bg-rose-900/50 px-3 py-1 rounded-full">Due in 5 days</span>
          </div>
          
          <div className="flex justify-between items-end mb-4">
            <div>
                <p className="text-zinc-400 text-sm">Next payment amount</p>
                <p className="text-3xl font-bold text-white tracking-tight">$1,200.00</p>
            </div>
             <p className="text-zinc-500 text-xs">Due on August 1st</p>
          </div>
          
          <button className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-transform flex justify-center items-center gap-2">
              Make Payment
          </button>
        </div>
      </motion.div>
      
      {/* Spacer for bottom nav */}
      <div className="h-24 w-full opacity-0 pointer-events-none" />
    </motion.div>
  );
}
