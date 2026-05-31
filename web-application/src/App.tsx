import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';
import { Lessons } from './pages/Lessons';
import { LessonPage } from './pages/LessonPage';
import { ChemAssembler } from './pages/ChemAssembler';
import { Progress } from './pages/Progress';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/levels" element={<Navigate to="/lessons" replace />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lesson" element={<LessonPage />} />
          <Route path="/sandbox" element={<ChemAssembler />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
