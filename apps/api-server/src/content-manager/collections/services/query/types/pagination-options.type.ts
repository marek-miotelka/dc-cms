export type CursorPaginationOptions = {
  type: 'cursor';
  limit: number;
  cursor?: string;
};

export type PagePaginationOptions = {
  type: 'page';
  page: number;
  perPage: number;
};

export type PaginationOptions = CursorPaginationOptions | PagePaginationOptions;
