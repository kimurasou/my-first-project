export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface Card {
  id: string;
  folderId: string;
  english: string;
  japanese: string;
  imageData?: string; // base64
  level: number;       // 0-5 SM-2 easiness
  interval: number;    // days until next review
  nextReview: number;  // timestamp
  repetitions: number;
  createdAt: number;
}

export type Screen = 'home' | 'study' | 'test';
