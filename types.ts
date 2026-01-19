
export enum AppTab {
  BRAINSTORM = 'brainstorm',
  VISUALIZE = 'visualize',
  LIVE = 'live'
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}
