import type { TopicPreset } from '@/types';

// Default preset for initial conversation
export const DEFAULT_PRESET: TopicPreset = {
  id: 'job-interview',
  name: 'Job Interview',
  topic: `You are attending a job interview. The interviewer asks you to describe yourself in three words and explain why you chose them, as well as provide a specific example. Try to answer clearly and effectively to leave a strong and positive impression.`,
  initialMessage: `Hello, thanks for coming in today. Let's start with a simple question. Can you describe yourself in three words?`,
};

// Available topic presets for conversation practice
export const TOPIC_PRESETS: TopicPreset[] = [
  DEFAULT_PRESET,
  {
    id: 'casual-chat',
    name: 'Casual Chat',
    topic: `You are having a casual conversation with a friendly English speaker. They want to get to know you better and practice everyday conversation topics like hobbies, interests, and daily life.`,
    initialMessage: `Hey there! Nice to meet you. I'd love to get to know you better. What do you like to do in your free time?`,
  },
  {
    id: 'travel-planning',
    name: 'Travel Planning',
    topic: `You are discussing travel plans with a travel advisor. They will help you plan your trip by asking about your preferences, budget, and interests. Practice expressing your travel desires and asking relevant questions.`,
    initialMessage: `Hello! I'm here to help you plan your next adventure. Where would you like to go, and what kind of experience are you looking for?`,
  },
];
