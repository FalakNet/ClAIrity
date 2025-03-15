import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import Index from './index';
import Counselor from './Counselor';
import AnxiousEase from './AnxiousEase';
import Login from './Login';
import Signup from './Signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/counselor" element={<Counselor />} />
        <Route path="/anxiousease" element={<AnxiousEase />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
