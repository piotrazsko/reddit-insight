export const DEFAULT_REPORT_SECTIONS = [
  {
    id: 'overview',
    title: 'Executive Summary',
    description: 'High-level overview of key discussions.',
    prompt: 'Identify the TOP 3 most important trends or discussions. What are people talking about most? Summarize briefly.',
    sourceIds: []
  },
  {
    id: 'bugs',
    title: 'Issues & Problems',
    description: 'Technical problems and complaints.',
    prompt: 'What problems are users reporting? Group similar issues together. Max 3-4 key issues.',
    sourceIds: []
  },
  {
    id: 'features',
    title: 'Requests & Ideas',
    description: 'What users want.',
    prompt: 'What features or improvements are users requesting? Summarize the top 3-4 requests.',
    sourceIds: []
  },
  {
    id: 'sentiment',
    title: 'Community Mood',
    description: 'Overall sentiment.',
    prompt: 'What is the overall mood? Positive, negative, or mixed? Give 2-3 examples of what drives this sentiment.',
    sourceIds: []
  }
];
