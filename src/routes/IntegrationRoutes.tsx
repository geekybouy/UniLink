
import React from 'react';
import { Route } from 'react-router-dom';
import IntegrationDashboard from '../pages/admin/IntegrationDashboard';
import DeveloperPortal from '../pages/developer/DeveloperPortal';

export const integrationRoutes = [
  <Route path="/admin/integrations" element={<IntegrationDashboard />} key="admin-integrations" />,
  <Route path="/developer" element={<DeveloperPortal />} key="developer-portal" />,
  <Route path="/developer/docs" element={<DeveloperPortal />} key="developer-docs" />
];
