import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './pages/Home';
import { Molecules } from './pages/Molecules';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/molecules" element={<Molecules />} />
      </Routes>
    </BrowserRouter>
  );
}
