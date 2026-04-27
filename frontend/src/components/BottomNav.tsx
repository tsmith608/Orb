"use client";

import { motion } from "framer-motion";
import { Home, Calendar, CreditCard, User, Heart } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home },
    { id: "calendar", icon: Calendar },
    { id: "payments", icon: CreditCard },
    { id: "profile", icon: User },
    { id: "connect", icon: Heart },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-4">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="w-full max-w-md mx-auto flex items-center justify-around bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-2xl shadow-black/50"
      >
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center gap-1 transition-all active:scale-90 w-16 ${activeTab === item.id ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-200'}`}
          >
            <item.icon size={26} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-pill" 
                className="absolute -bottom-1 h-1 w-8 bg-cyan-400 rounded-full" 
              />
            )}
          </button>
        ))}
      </motion.nav>
    </div>
  );
}
