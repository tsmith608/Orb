import React from 'react';
import { Plane } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-slate-900/50 backdrop-blur-lg p-4 flex items-center justify-center sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <Plane className="text-cyan-400 h-6 w-6" />
        <h1 className="text-xl font-bold text-white tracking-wider">
          Co-Pilot
        </h1>
      </div>
    </header>
  );
};

export default Header;
