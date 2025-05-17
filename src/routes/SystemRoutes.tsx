
import React from 'react';
import { Route } from 'react-router-dom';
import ContractDashboardPage from "../pages/ContractDashboard";
import SystemCheckPage from "../pages/SystemCheckPage";

const SystemRoutes = () => (
  <>
    <Route path="/contract-dashboard" element={<ContractDashboardPage />} />
    <Route path="/system-check" element={<SystemCheckPage />} />
  </>
);

export default SystemRoutes;
