export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
}

export const VOICES: VoiceOption[] = [
  {
    id: 'james',
    name: 'James',
    gender: 'male',
    description: 'Deep, authoritative voice'
  },
  {
    id: 'david',
    name: 'David',
    gender: 'male',
    description: 'Warm, friendly voice'
  },
  {
    id: 'sarah',
    name: 'Sarah',
    gender: 'female',
    description: 'Clear, professional voice'
  },
  {
    id: 'michael',
    name: 'Michael',
    gender: 'male',
    description: 'Energetic, youthful voice'
  },
  {
    id: 'emma',
    name: 'Emma',
    gender: 'female',
    description: 'Soft, gentle voice'
  }
];

// Backend compatibility mapping
export const VOICE_MAPPING = {
  'james': 'UR972wNGq3zluze0LoIp',
  'david': 'QRq5hPRAKf5ZhSlTBH6r',
  'sarah': 'jAAHNNqlbAX9iWjJPEtE',
  'michael': 'rPNcQ53R703tTmtue1AT',
  'emma': 'qi4PkV9c01kb869Vh7Su'
};