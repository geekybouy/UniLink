
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import ProfilePage from '../pages/ProfilePage';
import AlumniProfileView from '../pages/AlumniProfileView'; // NEW
import EditProfilePage from '../pages/CompleteProfile';
import CredentialWallet from '../pages/CredentialWallet';
import ShareCredentials from '../pages/ShareCredentials';
import SharedCredentials from '../pages/SharedCredentials';
import NetworkPage from '../pages/MyNetwork';
import AlumniDirectory from '../pages/AlumniDirectory';
import EventsPage from '../pages/EventsPage';
import JobsListingPage from '../pages/JobsListingPage';
import SettingsPage from '../pages/NotificationSettingsPage';
import PrivacySettings from '../pages/PrivacySettings';
import { ConnectionProvider } from '../contexts/ConnectionContext';
import UserDashboardPage from '../pages/UserDashboard';

export const mainRoutes = [
  <Route path="/dashboard" element={<Dashboard />} key="main-dashboard" />,
  <Route path="/profile" element={<ProfilePage />} key="main-profile" />,
  <Route path="/profile/view" element={<AlumniProfileView />} key="main-profile-view" />, // NEW
  <Route path="/edit-profile" element={<EditProfilePage />} key="main-edit-profile" />,
  <Route path="/credentials" element={<CredentialWallet />} key="main-credentials" />,
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
  <Route path="/privacy-settings" element={<PrivacySettings />} key="main-privacy-settings" />,
  <Route path="/user-dashboard" element={<UserDashboardPage />} key="main-user-dashboard" />,
];
