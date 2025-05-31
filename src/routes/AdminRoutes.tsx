
import React from 'react';
import { Route } from 'react-router-dom';
import AdminPage from '../pages/admin/AdminDashboard';
import ContentModeration from '../pages/admin/ContentModeration';
import AuditLogs from '../pages/admin/AuditLogs';
import FraudDetection from '../pages/admin/FraudDetection';

export const adminRoutes = [
  <Route path="/admin/dashboard" element={<AdminPage />} key="admin-dashboard" />,
  <Route path="/admin/content-moderation" element={<ContentModeration />} key="admin-content-moderation" />,
  <Route path="/admin/audit-logs" element={<AuditLogs />} key="admin-audit-logs" />,
  <Route path="/admin/fraud-detection" element={<FraudDetection />} key="admin-fraud-detection" />,
];
