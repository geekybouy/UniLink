
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import ProfilePage from '../pages/ProfilePage';
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

const MainRoutes = () => (
  <>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/edit-profile" element={<EditProfilePage />} />
    <Route path="/credentials" element={<CredentialWallet />} />
    <Route path="/share-credentials" element={<ShareCredentials />} />
    <Route path="/shared/:shareId" element={<SharedCredentials />} />
    {/* Wrap network and alumni-directory with ConnectionProvider */}
    <Route path="/network" element={
      <ConnectionProvider>
        <NetworkPage />
      </ConnectionProvider>
    } />
    <Route path="/alumni-directory" element={
      <ConnectionProvider>
        <AlumniDirectory />
      </ConnectionProvider>
    } />
    <Route path="/events" element={<EventsPage />} />
    <Route path="/jobs" element={<JobsListingPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/privacy-settings" element={<PrivacySettings />} />
  </>
);

export default MainRoutes;
