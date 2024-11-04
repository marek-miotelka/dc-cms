import { PaginationMeta } from './pagination-meta.type';

export interface QueryResult<T> {
  data: T[];
  meta: PaginationMeta;
}
