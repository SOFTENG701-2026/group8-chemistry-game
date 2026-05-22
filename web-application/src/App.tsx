import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './pages/Home';
import { Levels } from './pages/Levels';
import { ChemAssembler } from './pages/ChemAssembler';
import { LewisEditor } from './pages/LewisEditor';
import { AppHeader } from './components/AppHeader';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/levels" element={<Levels />} />
        <Route path="/sandbox" element={<ChemAssembler />} />
        <Route path="/lewis" element={<LewisEditor />} />
        {/* Progress page is placeholder for now */}
        <Route path="/progress" element={
          <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
            <AppHeader />
            <div style={{ padding: 20 }}>Progress Page (Coming Soon)</div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
