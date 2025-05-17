
import React from 'react';
import { Route } from 'react-router-dom';
import AdminPage from '../pages/admin/AdminDashboard';
import ContentModeration from '../pages/admin/ContentModeration';
import AuditLogs from '../pages/admin/AuditLogs';
import FraudDetection from '../pages/admin/FraudDetection';

const AdminRoutes = () => (
  <>
    <Route path="/admin/dashboard" element={<AdminPage />} />
    <Route path="/admin/content-moderation" element={<ContentModeration />} />
    <Route path="/admin/audit-logs" element={<AuditLogs />} />
    <Route path="/admin/fraud-detection" element={<FraudDetection />} />
  </>
);

export default AdminRoutes;
