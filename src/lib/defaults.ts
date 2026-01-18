export const DEFAULT_REPORT_SECTIONS = [
  {
    id: 'overview',
    title: 'Executive Summary',
    description: 'High-level overview of key discussions.',
    prompt: 'What are the TOP 3 most discussed topics across all posts? What themes emerge? What is the community focused on right now?',
    sourceIds: [],
    mode: 'overview' as const
  },
  {
    id: 'bugs',
    title: 'Issues & Problems',
    description: 'Technical problems and complaints.',
    prompt: 'What problems or frustrations are people expressing? Are there common pain points? What workarounds do people suggest?',
    sourceIds: [],
    mode: 'overview' as const
  },
  {
    id: 'features',
    title: 'Requests & Ideas',
    description: 'What users want.',
    prompt: 'What features or improvements does the community want? What tools or approaches are people recommending to others?',
    sourceIds: [],
    mode: 'overview' as const
  },
  {
    id: 'sentiment',
    title: 'Community Mood',
    description: 'Overall sentiment.',
    prompt: 'What is the overall mood of the community? Are people excited, frustrated, or neutral? What is driving these emotions?',
    sourceIds: [],
    mode: 'overview' as const
  }
];
