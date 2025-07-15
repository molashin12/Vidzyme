export interface VoiceOption {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  gender: 'male' | 'female';
}

export const VOICES = [
  {
    id: 'haitham',
    name: 'Haitham',
    gender: 'male',
    description: 'Deep, authoritative voice'
  },
  {
    id: 'yahya',
    name: 'Yahya',
    gender: 'male',
    description: 'Warm, friendly voice'
  },
  {
    id: 'sara',
    name: 'Sara',
    gender: 'female',
    description: 'Clear, professional voice'
  },
  {
    id: 'mazen',
    name: 'Mazen',
    gender: 'male',
    description: 'Energetic, youthful voice'
  },
  {
    id: 'asma',
    name: 'Asma',
    gender: 'female',
    description: 'Gentle, soothing voice'
  }
];

// Voice mapping for backend compatibility
export const VOICE_MAPPING: Record<string, string> = {
  'haitham': 'haitham',
  'yahya': 'yahya',
  'sara': 'sara',
  'mazen': 'mazen',
  'asma': 'asma'
};