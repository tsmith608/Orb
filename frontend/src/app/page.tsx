import React from 'react';
import Header from './Header';
import Hero from './Hero';
import MainContent from './MainContent';
import Footer from './Footer';

export default function Home() {
  return (
    <div className="bg-gray-50">
      <Header />
      <Hero />
      <MainContent />
      <Footer />
    </div>
  );
}
