
import React from 'react';
import { Route } from 'react-router-dom';
import KnowledgeBase from '../pages/KnowledgeHub';
import PostDetails from '../pages/KnowledgePostDetail';

const KnowledgeRoutes = () => (
  <>
    <Route path="/knowledge" element={<KnowledgeBase />} />
    <Route path="/knowledge/:postId" element={<PostDetails />} />
  </>
);

export default KnowledgeRoutes;
