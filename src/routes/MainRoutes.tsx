
import React from 'react';
import { Route } from 'react-router-dom';

import PrivacySettingsPage from '../pages/Settings'; // For /privacy-settings
// import CredentialWallet from '../pages/CredentialWallet'; // Remove legacy
import ShareCredentials from '../pages/ShareCredentials';
import SharedCredentials from '../pages/SharedCredentials';
import NetworkPage from '../pages/MyNetwork'; // Modern network page
import AlumniDirectory from '../pages/AlumniDirectory';
import EventsPage from '../pages/EventsPage';
import JobsListingPage from '../pages/JobsListingPage';
import NotificationSettingsPage from '../pages/NotificationSettingsPage';
import { ConnectionProvider } from '../contexts/ConnectionContext';
import MessagingPage from '../pages/MessagingPage';
import AICVMaker from '../pages/AICVMaker';
import MyApplicationsPage from '../pages/MyApplicationsPage';
import IntegrationDashboard from '../pages/admin/IntegrationDashboard';
import DeveloperPortal from '../pages/developer/DeveloperPortal';
import MobileCommunityPage from '../pages/MobileCommunityPage';
import Dashboard from '../pages/Dashboard';
import MorePage from '../pages/MorePage'; // Modern menu
import SettingsPage from '../pages/SettingsPage'; // Modern settings
import Credentials from '../pages/Credentials';

// Only modern, themed pages below:
export const mainRoutes = [
  <Route path="/dashboard" element={<Dashboard />} key="main-dashboard" />,
  <Route path="/credentials" element={<Credentials />} key="main-credential-wallet" />,
  <Route path="/share-credentials" element={<ShareCredentials />} key="main-share-credentials" />,
  <Route path="/shared/:shareId" element={<SharedCredentials />} key="main-shared" />,
  <Route path="/network" element={
    <ConnectionProvider>
      <NetworkPage />
    </ConnectionProvider>
  } key="main-network" />,
  <Route path="/alumni-directory" element={
    <ConnectionProvider>
      <AlumniDirectory />
    </ConnectionProvider>
  } key="main-alumni-directory" />,
  <Route path="/events" element={<EventsPage />} key="main-events" />,
  <Route path="/jobs" element={<JobsListingPage />} key="main-jobs" />,
  <Route path="/settings" element={<SettingsPage />} key="main-settings" />,
  <Route path="/privacy-settings" element={<PrivacySettingsPage />} key="main-privacy-settings" />,
  <Route path="/messages" element={<MessagingPage />} key="main-messages" />,
  <Route path="/ai-cv-maker" element={<AICVMaker />} key="main-ai-cv-maker" />,
  <Route path="/my-applications" element={<MyApplicationsPage />} key="main-my-applications" />,
  <Route path="/admin/integrations" element={<IntegrationDashboard />} key="admin-integrations" />,
  <Route path="/developer" element={<DeveloperPortal />} key="developer-portal" />,
  // Community (mobile): new page
  <Route path="/community" element={<MobileCommunityPage />} key="mobile-community" />,
  // Modern menu page
  <Route path="/more" element={<MorePage />} key="menu-more" />,
  <Route path="/credentials-list" element={<Credentials />} key="main-credentials-list" />,
];
