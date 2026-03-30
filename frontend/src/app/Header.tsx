import React from 'react';

const Header = () => {
  return (
    <header className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <a href="#" className="text-3xl font-bold tracking-tight text-red-700">
          BTD
        </a>
        <nav>
          <ul className="flex space-x-8">
            <li>
              <a href="#about" className="text-lg hover:text-red-500 transition-colors duration-300">
                About
              </a>
            </li>
            <li>
              <a href="#rules" className="text-lg hover:text-red-500 transition-colors duration-300">
                Rules
              </a>
            </li>
            <li>
              <a href="#venue" className="text-lg hover:text-red-500 transition-colors duration-300">
                Venue
              </a>
            </li>
             <li>
              <a href="#register" className="text-lg hover:text-red-500 transition-colors duration-300">
                Prize
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
