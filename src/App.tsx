import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import Index from './index';
import Counselor from './Counselor';
import AnxiousEase from './AnxiousEase';
import Login from './Login';
import Signup from './Signup';
import MindState from './MindState';
import AdminDashboard from './AdminDashboard';
import AuthCallback from './components/AuthCallback';
import StudentsList from './StudentsList';
import StudentDetail from './StudentDetail';

// Animation wrapper component
function AnimatedPage({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentContent, setCurrentContent] = useState(children);
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname) {
      setIsTransitioning(true);
      
      // Start fade-out animation
      const timer = setTimeout(() => {
        setCurrentContent(children);
        setIsTransitioning(false);
      }, 500); // Duration of the fade-out animation
      
      return () => clearTimeout(timer);
    }
  }, [children, location.pathname]);
  
  return (
    <div className={isTransitioning ? 'fade-out' : 'fade-in'}>
      {currentContent}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AnimatedPage><Index /></AnimatedPage>} />
        <Route path="/counselor" element={<AnimatedPage><Counselor /></AnimatedPage>} />
        <Route path="/anxiousease" element={<AnimatedPage><AnxiousEase /></AnimatedPage>} />
        <Route path="/mindstate" element={<AnimatedPage><MindState /></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/signup" element={<AnimatedPage><Signup /></AnimatedPage>} />
        <Route path="/admin" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
        {/* Add the auth callback route */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* New routes for student management */}
        <Route path="/admin/students" element={<StudentsList />} />
        <Route path="/admin/students/:studentId" element={<StudentDetail />} />
      </Routes>
    </Router>
  );
}

export default App;