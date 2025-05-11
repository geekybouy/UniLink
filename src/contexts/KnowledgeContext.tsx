
// Re-export everything from the refactored context structure
// This ensures backward compatibility with existing components

export { 
  KnowledgeProvider,
  useKnowledge
} from './knowledge/KnowledgeContext';

export * from './knowledge/KnowledgeTypes';
