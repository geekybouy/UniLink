
import React from 'react';
import { Route } from 'react-router-dom';
// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/SignupPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

export const authRoutes = [
  <Route path="/" element={<LoginPage />} key="auth-login-root" />,
  <Route path="/login" element={<LoginPage />} key="auth-login" />,
  <Route path="/register" element={<RegisterPage />} key="auth-register" />,
  <Route path="/forgot-password" element={<ForgotPasswordPage />} key="auth-forgot" />,
  <Route path="/reset-password" element={<ResetPasswordPage />} key="auth-reset" />,
];
