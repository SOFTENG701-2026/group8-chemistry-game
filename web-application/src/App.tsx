import { BrowserRouter, Routes, Route } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { Home } from './pages/Home';
import { Levels } from './pages/Levels';
import { ChemAssembler } from './pages/ChemAssembler';
import { LewisEditor } from './pages/LewisEditor';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/lewis" element={<LewisEditor />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/sandbox" element={<ChemAssembler />} />
          <Route path="/progress" element={<div style={{ padding: 20 }}>Progress Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
