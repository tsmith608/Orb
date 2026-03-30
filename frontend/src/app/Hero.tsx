import React from 'react';

const Hero = () => {
  return (
    <section className="bg-black text-white py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-red-600 mb-4 tracking-wider">
          THE BASKETBALL TOURNAMENT OF DEATH
        </h1>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Where hoops dreams and nightmares collide. Only one team leaves the court.
        </p>
        <a
          href="#register"
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-full transition-transform duration-300 transform hover:scale-105"
        >
          SIGN UP... IF YOU DARE
        </a>
      </div>
    </section>
  );
};

export default Hero;
