import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// import {adhdImage} from 'assets/adhd.webp'
// import {dyslexicImage} from 'dyslexia.jpeg'

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-blue-300 to-purple-300">
      {/* Hero Section */}
      <section className="w-full h-screen flex flex-col justify-center items-center text-center p-6">
        <motion.h1 
          className="text-6xl font-bold text-white drop-shadow-md"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Empowering Dyslexic & ADHD Learners
        </motion.h1>
        <motion.p 
          className="text-lg text-white mt-4 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Interactive tools and resources to help individuals with Dyslexia and ADHD learn effectively.
        </motion.p>
        <motion.div 
          className="mt-6 flex space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Link to="/dyslexicStudentPage" className="px-6 py-3 bg-white text-blue-600 rounded-lg shadow-md hover:bg-blue-100">Dyslexic Learning</Link>
          <Link to="/dyslexicGame" className="px-6 py-3 bg-white text-purple-600 rounded-lg shadow-md hover:bg-purple-100">Play Dyslexia Game</Link>
          <Link to="/adhdInput" className="px-6 py-3 bg-white text-green-600 rounded-lg shadow-md hover:bg-green-100">ADHD Learning Tool</Link>
        </motion.div>
      </section>

      {/* Dyslexia Section */}
      <section className="flex flex-col md:flex-row items-center p-10 bg-white justify-around">
        <img src= "/dyslexia.jpeg" alt="Dyslexia Info" className="h- w-1/3 rounded-lg shadow-lg" />
        <div className="md:ml-10 mt-6 md:mt-0">
          <h2 className="text-4xl font-semibold text-blue-600">Understanding Dyslexia</h2>
          <p className="mt-4 text-gray-700 max-w-lg">
            Dyslexia is a learning disorder that affects reading and language processing. With the right tools and methods,
            dyslexic individuals can learn effectively and excel in various fields.
          </p>
        </div>
      </section>

      {/* ADHD Section */}
      <section className="flex flex-col md:flex-row-reverse items-center p-10 bg-gray-100 justify-around">
        <img src='/adhd.jpeg' alt="ADHD Info" className="w-1/3 rounded-lg shadow-lg" />
        <div className="md:mr-10 mt-6 md:mt-0">
          <h2 className="text-4xl font-semibold text-green-600">Understanding ADHD</h2>
          <p className="mt-4 text-gray-700 max-w-lg">
            ADHD (Attention-Deficit/Hyperactivity Disorder) affects focus, self-control, and attention span. Our tools help individuals
            with ADHD stay organized and engaged in learning.
          </p>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="p-10 text-center bg-white">
        <h2 className="text-4xl font-semibold text-purple-600">Interactive Learning for Everyone</h2>
        <p className="mt-4 text-gray-700 max-w-3xl mx-auto">
          Our platform provides interactive games, structured learning paths, and engaging content designed to make learning enjoyable for all.
        </p>
      </section>
    </div>
  );
};

export default LandingPage;