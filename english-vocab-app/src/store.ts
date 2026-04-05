import { v4 as uuidv4 } from 'uuid';
import type { Folder, Card } from './types';

const FOLDERS_KEY = 'vocab_folders';
const CARDS_KEY = 'vocab_cards';

export function loadFolders(): Folder[] {
  try {
    return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveFolders(folders: Folder[]) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function loadCards(): Card[] {
  try {
    return JSON.parse(localStorage.getItem(CARDS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCards(cards: Card[]) {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function createFolder(name: string): Folder {
  return { id: uuidv4(), name, createdAt: Date.now() };
}

export function createCard(folderId: string, english: string, japanese: string, imageData?: string): Card {
  return {
    id: uuidv4(),
    folderId,
    english,
    japanese,
    imageData,
    level: 0,
    interval: 1,
    nextReview: Date.now(),
    repetitions: 0,
    createdAt: Date.now(),
  };
}

// SM-2 simplified algorithm
// quality: 0=Again, 1=Hard, 2=Good, 3=Easy
export function updateCardAfterReview(card: Card, quality: 0 | 1 | 2 | 3): Card {
  let { level, interval, repetitions } = card;
  const DAY = 86400000;

  if (quality === 0) {
    repetitions = 0;
    interval = 1;
    level = Math.max(0, level - 1);
  } else if (quality === 1) {
    repetitions = Math.max(0, repetitions - 1);
    interval = Math.max(1, Math.floor(interval * 0.6));
  } else if (quality === 2) {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else interval = Math.round(interval * 2.0);
    level = Math.min(5, level);
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 4;
    else interval = Math.round(interval * 2.5);
    level = Math.min(5, level + 1);
  }

  return {
    ...card,
    level,
    interval,
    repetitions,
    nextReview: Date.now() + interval * DAY,
  };
}
