export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'in'
  | 'between'
  | 'null'
  | 'notNull';

export type FilterCondition = {
  [K in FilterOperator]?: any;
};

export type FilterOptions = {
  [field: string]: FilterCondition | FilterOptions[] | undefined;
  $or?: FilterOptions[];
  $and?: FilterOptions[];
};
