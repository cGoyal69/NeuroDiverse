// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import DyslexicStudentPage from './pages/dyslexicStudentPage';
import DyslexicGame from './pages/Game/DyslexiaApp';
import LandingPage from './pages/LandingPage';
import AdhdLearningTool from './pages/adhdLearning';
import UserInput from './pages/takeInput';
function App() {
  return (
    <Router>
      <div className='w-screen h-screen flex flex-col justify-center items-center bg-slate-200'>

        {/* Routes for the pages */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dyslexicStudentPage" element={<DyslexicStudentPage />} />
          <Route path="/dyslexicGame" element={<DyslexicGame />} />
          <Route path="/adhdLearning" element={<AdhdLearningTool />} />
                <Route path="/adhdInput" element={<UserInput/>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
