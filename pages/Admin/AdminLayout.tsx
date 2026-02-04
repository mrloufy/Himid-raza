import React, { useState, Suspense } from 'react';
import LoginForm from '../../components/Admin/LoginForm';

// Lazy load Dashboard to ensure LoginForm loads even if Dashboard has dependency issues (like react-easy-crop)
const Dashboard = React.lazy(() => import('../../components/Admin/Dashboard'));

const AdminLayout: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    }>
      <Dashboard onLogout={() => setIsAuthenticated(false)} />
    </Suspense>
  );
};

export default AdminLayout;