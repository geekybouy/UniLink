
import React from 'react';
import { Route } from 'react-router-dom';
import ContractDashboardPage from "../pages/ContractDashboard";
import SystemCheckPage from "../pages/SystemCheckPage";

export const systemRoutes = [
  <Route path="/contract-dashboard" element={<ContractDashboardPage />} key="system-contract-dashboard" />,
  <Route path="/system-check" element={<SystemCheckPage />} key="system-check" />,
];
