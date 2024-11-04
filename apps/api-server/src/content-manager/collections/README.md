# Collections Module Documentation

## Overview

The Collections Module provides a flexible and powerful system for managing dynamic content types with support for:

- Hierarchical collections (parent-child relationships)
- Field relations (One-to-One, One-to-Many, Many-to-Many)
- Custom field types
- Bidirectional relationships
- Dynamic record management
- Advanced filtering and pagination
- Dynamic Swagger documentation

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Collection Structure](#collection-structure)
4. [Field Types](#field-types)
5. [Relations](#relations)
6. [Hierarchical Collections](#hierarchical-collections)
7. [Query System](#query-system)
8. [API Documentation](#api-documentation)
9. [Programmatic Usage](#programmatic-usage)

## Installation

The Collections Module is part of the core system. No additional installation is required.

## Basic Usage

### Creating a Collection

```typescript
// Example: Creating a Blog Posts collection
const createCollectionDto = {
  name: "Blog Posts",
  slug: "posts",
  description: "Collection for blog posts",
  fields: [
    {
      name: "title",
      type: "string",
      required: true,
      unique: true
    },
    {
      name: "content",
      type: "longtext",
      required: true
    }
  ]
};

await collectionsService.create(createCollectionDto);
```

### Adding Relations

```typescript
// Example: Adding categories to posts
const categoryRelationField = {
  name: "categories",
  type: "relation",
  required: false,
  unique: false,
  relation: {
    type: "manyToMany",
    target: "categories",
    bidirectional: true,
    inverseSide: {
      field: "posts",
      displayField: "title"
    }
  }
};
```

## Collection Structure

Collections are defined with the following structure:

```typescript
interface CollectionFields {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  fields: CollectionField[];
}

interface CollectionField {
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  description?: string;
  relation?: RelationConfig;
}
```

## Field Types

Available field types:

- `string`: Regular text field
- `longtext`: Long text content
- `boolean`: True/false values
- `number`: Decimal numbers
- `integer`: Whole numbers
- `date`: Date/time values
- `relation`: Relationship to other collections

## Relations

### Relation Types

1. One-to-One
```typescript
{
  type: "relation",
  relation: {
    type: "oneToOne",
    target: "profile",
    bidirectional: true
  }
}
```

2. One-to-Many
```typescript
{
  type: "relation",
  relation: {
    type: "oneToMany",
    target: "comments",
    bidirectional: true
  }
}
```

3. Many-to-Many
```typescript
{
  type: "relation",
  relation: {
    type: "manyToMany",
    target: "tags",
    bidirectional: true
  }
}
```

## Hierarchical Collections

Collections can be organized in a parent-child hierarchy, enabling structured content organization.

### Creating Parent-Child Collections

1. First, create the parent collection:
```json
{
  "name": "Products",
  "slug": "products",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "required": true,
      "unique": true
    }
  ]
}
```

2. Then create a child collection by referencing the parent's ID:
```json
{
  "name": "Product Variants",
  "slug": "variants",
  "parentId": 1,
  "fields": [
    {
      "name": "size",
      "type": "string",
      "required": true
    }
  ]
}
```

### Key Points About Hierarchical Collections

1. **Automatic Slug Prefixing**: Child collection slugs are automatically prefixed with their parent's slug (e.g., "products/variants")

2. **Automatic References**: Child collections get a `parentDocumentId` column that references their parent collection's records

3. **Querying Subcollections**:
   - Get all subcollections: `GET /content-manager/collections/{parentId}/subcollections`
   - Get hierarchical view: `GET /content-manager/collections?hierarchical=true`

4. **Moving Collections**:
   - Collections can be moved in the hierarchy using: `PUT /content-manager/collections/{id}/move`
   - Provide a new `parentId` or `null` to move to root level

5. **Validation**:
   - Circular references are prevented
   - Parent collection must exist
   - Slug conflicts are checked across the hierarchy

## Query System

The module includes a powerful query system for filtering, sorting, and paginating records:

### Filtering

```typescript
const records = await collectionsService.getCollectionData(collection, {
  filter: {
    title: { like: 'blog' },
    publishDate: { 
      gte: '2024-01-01',
      lte: '2024-12-31'
    },
    status: { in: ['published', 'draft'] }
  }
});
```

### Sorting

```typescript
const records = await collectionsService.getCollectionData(collection, {
  sort: {
    publishDate: 'desc',
    title: 'asc'
  }
});
```

### Pagination

```typescript
const records = await collectionsService.getCollectionData(collection, {
  pagination: {
    page: 1,
    pageSize: 20
  }
});
```

## API Documentation

The module provides dynamic Swagger documentation for all collections:

1. **Main Documentation**: `/docs`
   - Core API endpoints
   - Authentication
   - Collection management

2. **Collections Documentation**: `/docs/collections`
   - Dynamic endpoints for each collection
   - CRUD operations
   - Field-specific schemas
   - Relation handling

## Programmatic Usage

### Service Injection

```typescript
import { CollectionsService } from './collections.service';
import { CollectionRelationsService } from './services/relations.service';
import { CollectionRecordsService } from './services/records.service';
import { CollectionHierarchyService } from './services/hierarchy.service';
import { CollectionQueryService } from './services/query/collection-query.service';

@Injectable()
export class YourService {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly relationsService: CollectionRelationsService,
    private readonly recordsService: CollectionRecordsService,
    private readonly hierarchyService: CollectionHierarchyService,
    private readonly queryService: CollectionQueryService
  ) {}
}
```

### Managing Collections

```typescript
// Create a collection
const collection = await this.collectionsService.create({
  name: "Products",
  slug: "products",
  fields: [/* fields */]
});

// Create a child collection
const childCollection = await this.collectionsService.create({
  name: "Product Variants",
  slug: "variants",
  parentId: collection.id,
  fields: [/* fields */]
});

// Move a collection in hierarchy
await this.hierarchyService.moveCollection(childCollection.id, newParentId);

// Get collection hierarchy
const hierarchy = await this.hierarchyService.getCollectionHierarchy();
```

### Managing Records

```typescript
// Create a record with relations
const record = await this.collectionsService.createCollectionRecord(
  collection,
  {
    title: "New Product",
    price: 99.99
  },
  {
    categories: ['category-1-id', 'category-2-id']
  }
);

// Query records with filters and pagination
const records = await this.collectionsService.getCollectionData(
  collection,
  {
    filter: { price: { gte: 50 } },
    sort: { createdAt: 'desc' },
    pagination: { page: 1, pageSize: 20 },
    includeRelations: true
  }
);
```

## Best Practices

1. Always validate collection fields before creation
2. Use transactions for operations involving multiple tables
3. Handle relation cleanup when deleting records
4. Use proper error handling for collection operations
5. Implement proper access control for collection operations
6. Use the query system for efficient data retrieval
7. Leverage the hierarchical system for structured content

## Error Handling

The module provides specific exceptions for common errors:

- `CollectionNotFoundException`
- `CollectionFieldValidationException`
- `DuplicateFieldValueException`
- `CollectionRecordNotFoundException`
- `CollectionAlreadyExistsException`
- `CollectionOperationException`

Example:

```typescript
try {
  await collectionsService.create(createCollectionDto);
} catch (error) {
  if (error instanceof CollectionFieldValidationException) {
    // Handle validation error
  }
  throw error;
}
```
