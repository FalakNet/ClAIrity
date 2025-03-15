import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import Index from './index';
import Counselor from './Counselor';
import AnxiousEase from './AnxiousEase';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/counselor" element={<Counselor />} />
        <Route path="/anxiousease" element={<AnxiousEase />} />
      </Routes>
    </Router>
  );
}

export default App;
