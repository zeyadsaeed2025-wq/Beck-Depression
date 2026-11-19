import { GLOSSARY_TERMS } from '../data/glossaryTerms';

const FAVORITES_STORAGE_KEY = 'mnu_bdi_glossary_favorites_v1';
const VALID_TERM_IDS = new Set(GLOSSARY_TERMS.map((t) => t.id));

/**
 * Isolated localStorage persistence for Psychology Glossary favorites.
 * Stores ONLY term IDs — never examinee codes, responses, or test scores.
 */
export function loadFavoriteTermIds(): string[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(
        parsed.filter((id): id is string => typeof id === 'string' && VALID_TERM_IDS.has(id))
      )
    );
  } catch {
    return [];
  }
}

export function saveFavoriteTermIds(ids: string[]): string[] {
  const sanitized = Array.from(
    new Set(ids.filter((id) => VALID_TERM_IDS.has(id)))
  );
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(sanitized));
    }
  } catch {
    // Gracefully ignore storage quota / privacy mode restrictions
  }
  return sanitized;
}

export function toggleFavoriteTermId(currentIds: string[], termId: string): string[] {
  if (!VALID_TERM_IDS.has(termId)) return currentIds;
  const exists = currentIds.includes(termId);
  const next = exists
    ? currentIds.filter((id) => id !== termId)
    : [...currentIds, termId];
  return saveFavoriteTermIds(next);
}
