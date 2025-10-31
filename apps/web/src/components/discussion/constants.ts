// Constants for Discussion component

export const DEFAULT_NEW_POST = {
  title: '',
  content: '',
  community: '',
  type: 'text' as const,
  tags: [] as string[]
};

export const COMMENT_TREE_MAX_DEPTH = 10;

export const DEBOUNCE_DELAY_MS = 300;

export const ANIMATION_DURATION_MS = 600;

