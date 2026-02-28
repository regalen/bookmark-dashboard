export interface Bookmark {
  id: string;
  title: string;
  lanUrl?: string;
  wanUrl?: string;
  tags: string[];
  description?: string;
  pinned: boolean;
  createdAt: number;
}

export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark' | 'system';
