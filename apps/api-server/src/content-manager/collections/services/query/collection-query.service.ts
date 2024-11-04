import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { CollectionFields } from '../../models/Collection.model';
import { PaginationOptions } from './types/pagination-options.type';
import {
  FilterCondition,
  FilterOperator,
  FilterOptions,
} from './types/filter-options.type';
import { SortOptions } from './types/sort-options.type';
import { QueryResult } from './types/query-result.type';
import { PaginationMeta } from './types/pagination-meta.type';

@Injectable()
export class CollectionQueryService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async executeQuery<T>(
    collection: CollectionFields,
    options: {
      pagination?: PaginationOptions;
      filter?: FilterOptions;
      sort?: SortOptions;
      includeRelations?: boolean;
    } = {},
  ): Promise<QueryResult<T>> {
    const baseQuery = this.buildBaseQuery(collection, options);
    const countQuery = this.buildCountQuery(collection, options);

    // Get total count
    const [{ count }] = await countQuery;
    const total = parseInt(count as string, 10);

    // Execute main query with pagination
    const query = this.applyPagination(baseQuery, options.pagination);
    const data = await query;

    // Generate pagination metadata
    const meta = await this.generatePaginationMeta(
      options.pagination,
      total,
      data,
    );

    return { data, meta };
  }

  private buildBaseQuery(
    collection: CollectionFields,
    options: {
      filter?: FilterOptions;
      sort?: SortOptions;
      includeRelations?: boolean;
    },
  ): Knex.QueryBuilder {
    let query = this.knex(`cm_${collection.slug}`).select('*');

    if (options.filter) {
      query = this.applyFilters(query, options.filter);
    }

    if (options.sort) {
      query = this.applySorting(query, options.sort);
    }

    if (options.includeRelations) {
      query = this.includeRelations(query, collection);
    }

    return query;
  }

  private buildCountQuery(
    collection: CollectionFields,
    options: {
      filter?: FilterOptions;
    },
  ): Knex.QueryBuilder {
    let query = this.knex(`cm_${collection.slug}`).count('* as count');

    if (options.filter) {
      query = this.applyFilters(query, options.filter);
    }

    return query;
  }

  private applyFilters(
    query: Knex.QueryBuilder,
    filters: FilterOptions,
  ): Knex.QueryBuilder {
    if (filters.$or) {
      query.where((builder) => {
        filters.$or!.forEach((condition, index) => {
          const method = index === 0 ? 'where' : 'orWhere';
          builder[method]((subBuilder) => {
            this.applyFilterConditions(subBuilder, condition);
          });
        });
      });
    }

    if (filters.$and) {
      query.where((builder) => {
        filters.$and!.forEach((condition) => {
          builder.where((subBuilder) => {
            this.applyFilterConditions(subBuilder, condition);
          });
        });
      });
    }

    // Apply regular filters
    const regularFilters = { ...filters };
    delete regularFilters.$or;
    delete regularFilters.$and;
    this.applyFilterConditions(query, regularFilters);

    return query;
  }

  private applyFilterConditions(
    query: Knex.QueryBuilder,
    filters: FilterOptions,
  ): void {
    Object.entries(filters).forEach(([field, conditions]) => {
      // Skip logical operators
      if (field === '$or' || field === '$and') return;

      // Type guard to ensure conditions is FilterCondition
      if (
        conditions &&
        typeof conditions === 'object' &&
        !Array.isArray(conditions)
      ) {
        Object.entries(conditions as FilterCondition).forEach(
          ([operator, value]) => {
            switch (operator as FilterOperator) {
              case 'eq':
                query.where(field, '=', value);
                break;
              case 'neq':
                query.where(field, '!=', value);
                break;
              case 'gt':
                query.where(field, '>', value);
                break;
              case 'gte':
                query.where(field, '>=', value);
                break;
              case 'lt':
                query.where(field, '<', value);
                break;
              case 'lte':
                query.where(field, '<=', value);
                break;
              case 'like':
                query.where(field, 'like', `%${value}%`);
                break;
              case 'in':
                query.whereIn(field, value as any[]);
                break;
              case 'between':
                query.whereBetween(field, value as [any, any]);
                break;
              case 'null':
                query.whereNull(field);
                break;
              case 'notNull':
                query.whereNotNull(field);
                break;
            }
          },
        );
      }
    });
  }

  private applySorting(
    query: Knex.QueryBuilder,
    sort: SortOptions,
  ): Knex.QueryBuilder {
    sort.forEach(({ field, direction }) => {
      query.orderBy(field, direction);
    });

    return query;
  }

  private applyPagination(
    query: Knex.QueryBuilder,
    pagination?: PaginationOptions,
  ): Knex.QueryBuilder {
    if (!pagination) {
      return query;
    }

    if (pagination.type === 'cursor') {
      if (pagination.cursor) {
        query.where('id', '>', pagination.cursor);
      }
      query.limit(pagination.limit);
    } else {
      const offset = (pagination.page - 1) * pagination.perPage;
      query.offset(offset).limit(pagination.perPage);
    }

    return query;
  }

  private async generatePaginationMeta(
    pagination: PaginationOptions | undefined,
    total: number,
    data: any[],
  ): Promise<PaginationMeta> {
    if (!pagination) {
      return {
        type: 'page',
        currentPage: 1,
        perPage: total,
        total,
        pageCount: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    if (pagination.type === 'cursor') {
      const hasMore = data.length === pagination.limit;
      const nextCursor = hasMore ? data[data.length - 1].id : undefined;
      const prevCursor = pagination.cursor;

      return {
        type: 'cursor',
        hasMore,
        nextCursor,
        prevCursor,
        total,
      };
    } else {
      const pageCount = Math.ceil(total / pagination.perPage);
      const hasNextPage = pagination.page < pageCount;
      const hasPrevPage = pagination.page > 1;

      return {
        type: 'page',
        currentPage: pagination.page,
        perPage: pagination.perPage,
        total,
        pageCount,
        hasNextPage,
        hasPrevPage,
      };
    }
  }

  private includeRelations(
    query: Knex.QueryBuilder,
    collection: CollectionFields,
  ): Knex.QueryBuilder {
    const relationFields = collection.fields.filter(
      (field) => field.type === 'relation',
    );

    for (const field of relationFields) {
      if (!field.relation) continue;

      const relationTableName = `cm_rel_${collection.slug}_${field.relation.target}_${field.name}`;
      const targetTableName = `cm_${field.relation.target}`;

      query = query
        .leftJoin(
          relationTableName,
          `cm_${collection.slug}.documentId`,
          `${relationTableName}.sourceId`,
        )
        .leftJoin(
          targetTableName,
          `${relationTableName}.targetId`,
          `${targetTableName}.documentId`,
        )
        .select(
          this.knex.raw(
            `JSON_ARRAYAGG(JSON_OBJECT('id', ${targetTableName}.documentId, 'data', ${targetTableName}.*)) as ${field.name}`,
          ),
        )
        .groupBy(`cm_${collection.slug}.documentId`);
    }

    return query;
  }
}
