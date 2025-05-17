
import React from 'react';
import { Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { KnowledgeProvider } from './contexts/KnowledgeContext';
import { ThemeProvider } from './components/ui/theme-provider';

import { authRoutes } from './routes/AuthRoutes';
import { mainRoutes } from './routes/MainRoutes';
import { adminRoutes } from './routes/AdminRoutes';
import { knowledgeRoutes } from './routes/KnowledgeRoutes';
import { systemRoutes } from './routes/SystemRoutes';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <KnowledgeProvider>
            <Routes>
              {authRoutes}
              {mainRoutes}
              {knowledgeRoutes}
              {adminRoutes}
              {systemRoutes}
            </Routes>
          </KnowledgeProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
