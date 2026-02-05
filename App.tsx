
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ContentProvider } from './context/SiteContext';
import Home from './pages/Home';
import AdminLayout from './pages/Admin/AdminLayout';
import AllCategories from './pages/AllCategories';
import AllProjects from './pages/AllProjects';
import VisualEditor from './pages/VisualEditor';

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ContentProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminLayout />} />
          <Route path="/admin/editor" element={<VisualEditor />} />
          <Route path="/categories" element={<AllCategories />} />
          <Route path="/portfolio" element={<AllProjects />} />
        </Routes>
      </ContentProvider>
    </Router>
  );
};

export default App;
