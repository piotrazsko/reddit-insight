export const DEFAULT_REPORT_SECTIONS = [
  {
    id: 'overview',
    title: 'Executive Summary',
    description: 'High-level overview of the most critical discussions.',
    prompt: 'Summarize the top 3 most important discussions across all subreddits. Focus on "big news" or major controversies.',
    sourceId: undefined
  },
  {
    id: 'bugs',
    title: 'Bugs & Issues',
    description: 'Summary of technical problems reported by users.',
    prompt: 'Identify comments discussing bugs, crashes, errors, or technical failures. Group by specific issue.',
    sourceId: undefined
  },
  {
    id: 'features',
    title: 'Feature Requests',
    description: 'What are users asking for?',
    prompt: 'Extract requests for new features, improvements, or changes to existing functionality.',
    sourceId: undefined
  },
  {
    id: 'sentiment',
    title: 'User Sentiment',
    description: 'General mood of the community.',
    prompt: 'Analyze the overall tone (Positive/Negative/Neutral). Cite specific threads that drive this sentiment.',
    sourceId: undefined
  }
];
