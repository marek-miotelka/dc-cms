export type CursorPaginationMeta = {
  type: 'cursor';
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
  total: number;
};

export type PagePaginationMeta = {
  type: 'page';
  currentPage: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PaginationMeta = CursorPaginationMeta | PagePaginationMeta;
