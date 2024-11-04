## Articles Module Documentation

The Articles module provides a complete CRUD API for managing articles in the CMS system.

### Features

- Create, read, update, and delete articles
- JWT authentication protection
- Input validation
- Swagger/OpenAPI documentation
- Database persistence with Knex.js

### API Endpoints

All endpoints require JWT authentication via Bearer token.

#### Create Article
```http
POST /articles
```
Creates a new article with the provided data.

**Request Body:**
```json
{
  "name": "Article Title",
  "description": "Article content..."
}
```

#### Get All Articles
```http
GET /articles
```
Retrieves a list of all articles.

#### Get Article by ID
```http
GET /articles/:id
```
Retrieves a specific article by its ID.

#### Update Article
```http
PUT /articles/:id
```
Updates an existing article.

**Request Body:**
```json
{
  "name": "Updated Title",
  "description": "Updated content..."
}
```

#### Delete Article
```http
DELETE /articles/:id
```
Deletes an article by its ID.

### Database Schema

The articles table includes the following fields:

- `id` (number) - Auto-incrementing primary key
- `documentId` (UUID) - Unique identifier
- `name` (string) - Article title
- `description` (text) - Article content
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

### Models

#### ArticleFields Interface
```typescript
interface ArticleFields extends BaseModelFields {
  name: string;
  description: string;
}
```

### DTOs

#### CreateArticleDto
- `name` (string) - Required
- `description` (string) - Required

#### UpdateArticleDto
Extends CreateArticleDto with the same fields.

### Services

The `ArticlesService` extends the base `CrudService` and provides:
- Basic CRUD operations
- Custom find methods (findByName, findAll)
- Database integration via Knex.js

### Error Handling

The module includes comprehensive error handling for:
- Not Found (404) responses
- Validation errors (400)
- Database errors
- Authentication errors (401)

### Usage Example

```typescript
// Create an article
const article = await articlesService.create({
  name: "Getting Started",
  description: "Welcome to our CMS..."
});

// Update an article
const updated = await articlesService.update(article.id, {
  name: "Getting Started Guide",
  description: "Updated content..."
});

// Delete an article
await articlesService.delete(article.id);
```
