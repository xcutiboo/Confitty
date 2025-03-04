export interface SearchableItem {
  key: string;
  label: string;
  category: string;
  categoryLabel: string;
  description: string;
  tags?: string[];
}

export interface SearchMatch {
  text: string;
  matched: boolean;
}

export interface SearchResult {
  item: SearchableItem;
  score: number;
  labelMatches: SearchMatch[];
}
