import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './pages/Home';
import { Levels } from './pages/Levels';
import { ChemAssembler } from './pages/ChemAssembler';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/levels" element={<Levels />} />
        <Route path="/sandbox" element={<ChemAssembler />} />
        {/* Progress page is placeholder for now */}
        <Route path="/progress" element={<div style={{ padding: 20 }}>Progress Page (Coming Soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
