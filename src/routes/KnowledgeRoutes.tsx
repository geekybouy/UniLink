
import React from 'react';
import { Route } from 'react-router-dom';
import KnowledgeBase from '../pages/KnowledgeHub';
import PostDetails from '../pages/KnowledgePostDetail';

export const knowledgeRoutes = [
  <Route path="/knowledge" element={<KnowledgeBase />} key="knowledge-base" />,
  <Route path="/knowledge/:postId" element={<PostDetails />} key="knowledge-details" />,
];
