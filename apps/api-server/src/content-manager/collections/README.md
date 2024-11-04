# Collections Module Documentation

## Overview

The Collections Module provides a flexible and powerful system for managing dynamic content types with support for:

- Hierarchical collections (parent-child relationships)
- Field relations (One-to-One, One-to-Many, Many-to-Many)
- Custom field types
- Bidirectional relationships
- Dynamic record management

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Collection Structure](#collection-structure)
4. [Field Types](#field-types)
5. [Relations](#relations)
6. [API Examples](#api-examples)
7. [Programmatic Usage](#programmatic-usage)

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

## API Examples

### Creating a Collection

```http
POST /content-manager/collections
Content-Type: application/json

{
  "name": "Blog Posts",
  "slug": "posts",
  "fields": [
    {
      "name": "title",
      "type": "string",
      "required": true,
      "unique": true
    },
    {
      "name": "content",
      "type": "longtext",
      "required": true
    },
    {
      "name": "categories",
      "type": "relation",
      "required": false,
      "relation": {
        "type": "manyToMany",
        "target": "categories",
        "bidirectional": true,
        "inverseSide": {
          "field": "posts",
          "displayField": "title"
        }
      }
    }
  ]
}
```

### Creating Records

```http
POST /posts
Content-Type: application/json

{
  "data": {
    "title": "My First Post",
    "content": "Hello World!"
  },
  "relations": {
    "categories": ["category-1-id", "category-2-id"]
  }
}
```

### Querying Records with Relations

```http
GET /posts?includeRelations=true
```

## Programmatic Usage

### Service Injection

```typescript
import { CollectionsService } from './collections.service';
import { CollectionRelationsService } from './services/relations.service';
import { CollectionRecordsService } from './services/records.service';

@Injectable()
export class YourService {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly relationsService: CollectionRelationsService,
    private readonly recordsService: CollectionRecordsService
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

// Update a collection
await this.collectionsService.update(collection.id, {
  fields: [/* updated fields */]
});

// Delete a collection
await this.collectionsService.delete(collection.id);
```

### Managing Records

```typescript
// Create a record
const record = await this.recordsService.createCollectionRecord(
  collection,
  {
    title: "New Product",
    price: 99.99
  }
);

// Update a record
await this.recordsService.updateCollectionRecord(
  collection,
  record.documentId,
  {
    price: 89.99
  }
);

// Delete a record
await this.recordsService.deleteCollectionRecord(
  collection,
  record.documentId
);
```

### Managing Relations

```typescript
// Create a relation
await this.relationsService.createRelation(
  collection.slug,
  "categories",
  sourceId,
  targetId,
  "manyToMany"
);

// Get related records
const related = await this.relationsService.getRelatedRecords(
  collection.slug,
  "categories",
  sourceId,
  "manyToMany"
);
```

## Best Practices

1. Always validate collection fields before creation
2. Use transactions for operations involving multiple tables
3. Handle relation cleanup when deleting records
4. Use proper error handling for collection operations
5. Implement proper access control for collection operations

## Error Handling

The module provides specific exceptions for common errors:

- `CollectionNotFoundException`
- `CollectionFieldValidationException`
- `DuplicateFieldValueException`
- `CollectionRecordNotFoundException`

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
