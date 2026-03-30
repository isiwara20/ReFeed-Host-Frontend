import React from 'react';
import './styles/global.css';
import Navbar from '../components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import VideoSection from './components/VideoSection';
import Footer from './components/Footer';

const HomePage = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <VideoSection />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
