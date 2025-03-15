import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import Index from './index';
import Counselor from './Counselor';
import AnxiousEase from './AnxiousEase';
import Login from './Login';
import Signup from './Signup';

function App() {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    // Function to check and update orientation
    const checkOrientation = () => {
      const isLandscapeOrientation = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeOrientation);
    };

    // Check orientation on initial render
    checkOrientation();

    // Add event listener for orientation changes or resize
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <div className="app-container">
      {isLandscape && (
        <div className="orientation-message">
          <div className="orientation-content">
            <span className="rotate-icon">⟳</span>
            <p>Please rotate your device to portrait mode for the best experience</p>
          </div>
        </div>
      )}
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/counselor" element={<Counselor />} />
          <Route path="/anxiousease" element={<AnxiousEase />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;