export interface Group {
  id: string;
  name: string;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  title: string;
  lanUrl?: string;
  wanUrl?: string;
  tags: string[];
  description?: string;
  pinned: boolean;
  createdAt: number;
  groupIds: string[];
}

export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark' | 'system';
