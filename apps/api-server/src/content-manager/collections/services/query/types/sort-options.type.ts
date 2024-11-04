export type SortDirection = 'asc' | 'desc';

export type SortField = {
  field: string;
  direction: SortDirection;
};

export type SortOptions = SortField[];
