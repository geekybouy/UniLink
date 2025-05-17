
import React from 'react';
import { Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { KnowledgeProvider } from './contexts/KnowledgeContext';
import { ThemeProvider } from './components/ui/theme-provider';

import AuthRoutes from './routes/AuthRoutes';
import MainRoutes from './routes/MainRoutes';
import AdminRoutes from './routes/AdminRoutes';
import KnowledgeRoutes from './routes/KnowledgeRoutes';
import SystemRoutes from './routes/SystemRoutes';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <KnowledgeProvider>
            <Routes>
              <AuthRoutes />
              <MainRoutes />
              <KnowledgeRoutes />
              <AdminRoutes />
              <SystemRoutes />
            </Routes>
          </KnowledgeProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

