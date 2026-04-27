"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Heart, Undo } from 'lucide-react';

const users = [
  { id: 1, name: 'Jessica, 34', bio: 'Lawyer, mother of two. Looking for someone who understands the co-parenting life. Love hiking and wine tasting.', image: '/placeholder-f.jpg' },
  { id: 2, name: 'Mark, 41', bio: 'Software engineer and weekend musician. My kids are my world. Seeking a genuine connection.', image: '/placeholder-m1.jpg' },
  { id: 3, name: 'Samantha, 38', bio: 'Freelance graphic designer. Passionate about art, travel, and building a positive, blended family.', image: '/placeholder-f1.jpg' },
  { id: 4, name: 'David, 45', bio: 'Just a dad trying to make it work. Love to cook, fish, and watch old movies.', image: '/placeholder-m2.jpg' },
];

const SwipeCard = ({ user, onSwipe }) => (
  <motion.div
    className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl"
    drag="x"
    dragConstraints={{ left: 0, right: 0 }}
    onDragEnd={(e, { offset, velocity }) => {
      const swipe = Math.abs(offset.x) * velocity.x;
      if (swipe < -10000) {
        onSwipe('right');
      } else if (swipe > 10000) {
        onSwipe('left');
      }
    }}
    whileDrag={{ scale: 1.05 }}
    exit={{ x: 300, opacity: 0, transition: { duration: 0.5 } }}
    style={{
      backgroundImage: `url(${user.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
      <h3 className="text-3xl font-bold text-white">{user.name}</h3>
      <p className="text-white/90 mt-2">{user.bio}</p>
    </div>
  </motion.div>
);

const ConnectPage = () => {
  const [profiles, setProfiles] = useState(users);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSwipe = (direction) => {
    console.log(`Swiped ${direction}`);
    setActiveIndex(prev => (prev + 1) % profiles.length);
  };

  const currentProfile = profiles[activeIndex];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-4">
      <div className="w-full max-w-sm h-[70vh] relative">
        <AnimatePresence>
          {currentProfile && (
            <SwipeCard key={currentProfile.id} user={currentProfile} onSwipe={handleSwipe} />
          )}
        </AnimatePresence>
        {!currentProfile && (
           <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 rounded-2xl">
            <p className="text-xl text-zinc-400">No more profiles</p>
            <button 
              onClick={() => setActiveIndex(0)}
              className="mt-4 px-6 py-2 bg-violet-600 rounded-full font-semibold"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center space-x-6 mt-8">
        <button className="p-4 bg-zinc-800 rounded-full text-amber-500 shadow-lg">
          <Undo size={24} />
        </button>
        <button onClick={() => handleSwipe('left')} className="p-6 bg-zinc-800 rounded-full text-rose-500 shadow-lg transform scale-125">
          <X size={32} />
        </button>
        <button onClick={() => handleSwipe('right')} className="p-6 bg-zinc-800 rounded-full text-emerald-400 shadow-lg transform scale-125">
          <Heart size={32} />
        </button>
        <button className="p-4 bg-zinc-800 rounded-full text-cyan-400 shadow-lg">
          <User size={24} />
        </button>
      </div>
    </div>
  );
};

export default ConnectPage;
