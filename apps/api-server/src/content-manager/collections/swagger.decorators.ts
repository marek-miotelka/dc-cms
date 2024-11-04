import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';

export const ApiCreateCollection = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new collection',
      description:
        'Creates a new collection with fields and optional relations. If parentId is provided, creates a subcollection.',
    }),
    ApiBody({
      schema: {
        example: {
          name: 'Blog Posts',
          slug: 'posts',
          description: 'Collection of blog posts',
          fields: [
            {
              name: 'title',
              type: 'string',
              required: true,
              unique: false,
              description: 'The title of the post',
            },
            {
              name: 'category',
              type: 'relation',
              required: false,
              unique: false,
              description: 'The category of this post',
              relation: {
                type: 'oneToOne',
                target: 'categories',
                bidirectional: true,
                inverseSide: {
                  field: 'post',
                  displayField: 'title',
                },
              },
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Collection created successfully',
      type: CreateCollectionDto,
    }),
    ApiResponse({
      status: 400,
      description:
        'Invalid collection data, field configuration, or relation setup',
    }),
  );

export const ApiUpdateCollection = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update an existing collection',
      description:
        'Updates collection fields, relations, and metadata. Handles field type changes and relation modifications.',
    }),
    ApiParam({
      name: 'documentId',
      description: 'Collection document ID',
      type: 'string',
    }),
    ApiBody({ type: UpdateCollectionDto }),
    ApiResponse({
      status: 200,
      description: 'Collection updated successfully',
      type: UpdateCollectionDto,
    }),
    ApiResponse({ status: 404, description: 'Collection not found' }),
    ApiResponse({
      status: 400,
      description: 'Invalid field configuration or relation setup',
    }),
  );

export const ApiGetCollections = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all collections',
      description:
        'Retrieves all collections. Can return flat list or hierarchical structure.',
    }),
    ApiQuery({
      name: 'hierarchical',
      required: false,
      type: Boolean,
      description:
        'If true, returns collections in a tree structure with parent-child relationships',
    }),
    ApiResponse({
      status: 200,
      description: 'List of collections',
      type: [CreateCollectionDto],
    }),
  );

export const ApiGetCollection = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get collection by ID',
      description:
        'Retrieves a single collection with all its fields and relation configurations',
    }),
    ApiParam({
      name: 'documentId',
      description: 'Collection document ID',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Collection details',
      type: CreateCollectionDto,
    }),
    ApiResponse({ status: 404, description: 'Collection not found' }),
  );

export const ApiDeleteCollection = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete a collection',
      description:
        'Deletes a collection, its fields, and all related data including relation tables',
    }),
    ApiParam({
      name: 'documentId',
      description: 'Collection document ID',
      type: 'string',
    }),
    ApiResponse({
      status: 204,
      description: 'Collection deleted successfully',
    }),
    ApiResponse({ status: 404, description: 'Collection not found' }),
  );

export const ApiGetSubcollections = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get subcollections of a collection',
      description:
        'Retrieves immediate child collections of the specified parent collection',
    }),
    ApiParam({
      name: 'id',
      description: 'Parent collection ID',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'List of subcollections',
      type: [CreateCollectionDto],
    }),
    ApiResponse({ status: 404, description: 'Parent collection not found' }),
  );

export const ApiMoveCollection = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Move collection in hierarchy',
      description:
        'Changes the parent of a collection, updating the hierarchy structure',
    }),
    ApiParam({
      name: 'id',
      description: 'Collection ID to move',
      type: 'string',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['newParentId'],
        properties: {
          newParentId: {
            type: 'number',
            nullable: true,
            description: 'New parent collection ID or null for root level',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Collection moved successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid move operation (e.g., circular reference)',
    }),
    ApiResponse({ status: 404, description: 'Collection not found' }),
  );

export const ApiCreateRecord = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new record in collection',
      description: 'Creates a record with field values and optional relations',
    }),
    ApiParam({
      name: 'collectionSlug',
      description: 'Collection slug',
      type: 'string',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            description: 'Record field values',
          },
          relations: {
            type: 'object',
            description: 'Related records by field name',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string',
                description: 'Document IDs of related records',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Record created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid data or relation configuration',
    }),
    ApiResponse({ status: 404, description: 'Collection not found' }),
  );

export const ApiGetRecords = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all records from collection',
      description: 'Retrieves all records with optional related data',
    }),
    ApiParam({
      name: 'collectionSlug',
      description: 'Collection slug',
      type: 'string',
    }),
    ApiQuery({
      name: 'includeRelations',
      required: false,
      type: Boolean,
      description: 'Include related records in response',
    }),
    ApiResponse({
      status: 200,
      description: 'List of records',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            documentId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          additionalProperties: true,
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Collection not found' }),
  );

export const ApiGetRecord = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get record by ID',
      description: 'Retrieves a single record with optional related data',
    }),
    ApiParam({
      name: 'collectionSlug',
      description: 'Collection slug',
      type: 'string',
    }),
    ApiParam({
      name: 'documentId',
      description: 'Record document ID',
      type: 'string',
    }),
    ApiQuery({
      name: 'includeRelations',
      required: false,
      type: Boolean,
      description: 'Include related records in response',
    }),
    ApiResponse({
      status: 200,
      description: 'Record details',
      schema: {
        type: 'object',
        properties: {
          documentId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        additionalProperties: true,
      },
    }),
    ApiResponse({ status: 404, description: 'Record or collection not found' }),
  );

export const ApiUpdateRecord = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update a record',
      description: 'Updates record field values and relations',
    }),
    ApiParam({
      name: 'collectionSlug',
      description: 'Collection slug',
      type: 'string',
    }),
    ApiParam({
      name: 'documentId',
      description: 'Record document ID',
      type: 'string',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            description: 'Updated field values',
          },
          relations: {
            type: 'object',
            description: 'Updated related records by field name',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string',
                description: 'Document IDs of related records',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Record updated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid data or relation configuration',
    }),
    ApiResponse({ status: 404, description: 'Record or collection not found' }),
  );

export const ApiDeleteRecord = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete a record',
      description: 'Deletes a record and its relations',
    }),
    ApiParam({
      name: 'collectionSlug',
      description: 'Collection slug',
      type: 'string',
    }),
    ApiParam({
      name: 'documentId',
      description: 'Record document ID',
      type: 'string',
    }),
    ApiResponse({
      status: 204,
      description: 'Record deleted successfully',
    }),
    ApiResponse({ status: 404, description: 'Record or collection not found' }),
  );
