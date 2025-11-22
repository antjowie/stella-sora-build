// Auto-generated - do not edit
// Generated at: 2025-11-22T02:15:56.460Z

export type NoteId = 90011 | 90012 | 90013 | 90014 | 90015 | 90016 | 90017 | 90018 | 90019 | 90020 | 90021 | 90022 | 90023;

export const noteIds: NoteId[] = [90011, 90012, 90013, 90014, 90015, 90016, 90017, 90018, 90019, 90020, 90021, 90022, 90023];

export const getNoteImageUrl = (id: NoteId): string => `/notes/note_${id}.webp`;

// For fallback/default image
export const getNoteImageWithFallback = (id: number): string => {
  const defaultImage = `/notes/missing.webp`;
  try {
    return noteIds.includes(id as NoteId) ? `/notes/note_${id}.webp` : defaultImage;
  } catch {
    return defaultImage;
  }
};

// Utility to preload note images
export const preloadNoteImages = () => {
  if (typeof window === 'undefined') return;

  noteIds.forEach(id => {
    const img = new Image();
    img.src = getNoteImageUrl(id);
  });
};
