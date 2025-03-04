import { SearchableItem, SearchMatch, SearchResult } from './search.types';

const MIN_QUERY_LENGTH = 2;
const DEFAULT_RESULT_LIMIT = 12;

const Score = {
  EXACT_LABEL:       100,
  LABEL_PREFIX:       80,
  LABEL_WORD_PREFIX:  70,
  LABEL_CONTAINS:     60,
  KEY_CONTAINS:       50,
  TAG_CONTAINS:       45,
  DESCRIPTION_WORD:   35,
  DESCRIPTION:        25,
  CATEGORY:           15,
} as const;

function scoreItem(item: SearchableItem, query: string): number {
  const q = query.toLowerCase();
  const label = item.label.toLowerCase();
  const key = item.key.toLowerCase();
  const description = item.description.toLowerCase();
  const category = item.categoryLabel.toLowerCase();
  const tags = (item.tags ?? []).map(t => t.toLowerCase());

  if (label === q) return Score.EXACT_LABEL;
  if (label.startsWith(q)) return Score.LABEL_PREFIX;
  if (label.split(/\s+/).some(word => word.startsWith(q))) return Score.LABEL_WORD_PREFIX;
  if (label.includes(q)) return Score.LABEL_CONTAINS;
  if (key.includes(q)) return Score.KEY_CONTAINS;
  if (tags.some(t => t.includes(q))) return Score.TAG_CONTAINS;
  if (description.split(/\s+/).some(word => word.toLowerCase().startsWith(q))) return Score.DESCRIPTION_WORD;
  if (description.includes(q)) return Score.DESCRIPTION;
  if (category.includes(q)) return Score.CATEGORY;

  return 0;
}

export function highlight(text: string, query: string): SearchMatch[] {
  const q = query.toLowerCase().trim();
  if (!q) return [{ text, matched: false }];

  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);

  if (idx === -1) return [{ text, matched: false }];

  const segments: SearchMatch[] = [];
  if (idx > 0) segments.push({ text: text.slice(0, idx), matched: false });
  segments.push({ text: text.slice(idx, idx + q.length), matched: true });
  if (idx + q.length < text.length) segments.push({ text: text.slice(idx + q.length), matched: false });

  return segments;
}

export function search(
  items: SearchableItem[],
  query: string,
  limit = DEFAULT_RESULT_LIMIT
): SearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  return items
    .map(item => ({
      item,
      score: scoreItem(item, trimmed),
      labelMatches: highlight(item.label, trimmed),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
    .slice(0, limit);
}
