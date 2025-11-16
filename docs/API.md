# API Documentation - Bluwe Cosméticos Sistema de Produção

## Overview

Esta documentação descreve as APIs disponíveis no sistema de produção da Bluwe Cosméticos.

## Base URL
```
http://localhost:3000/api
```

## Authentication

A maioria das APIs requer autenticação. Use o endpoint de login para obter um token.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@bluwe.com.br",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "name": "Administrador",
    "email": "admin@bluwe.com.br",
    "role": "admin",
    "permissions": ["admin", "kanban", "quality", "mod", "semi-finished"]
  },
  "token": "base64-encoded-token"
}
```

### Logout
```http
DELETE /auth/login
```

## Endpoints

### Products

#### List All Products
```http
GET /products
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "op": "string",
      "batch": "string",
      "quantity": "number",
      "currentStage": "string",
      "status": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

#### Get Product by ID
```http
GET /products/[id]
```

#### Create Product
```http
POST /products
Content-Type: application/json

{
  "name": "string",
  "op": "string",
  "batch": "string",
  "quantity": "number",
  "currentStage": "string"
}
```

#### Update Product
```http
PUT /products/[id]
Content-Type: application/json

{
  "name": "string",
  "op": "string",
  "batch": "string",
  "quantity": "number",
  "currentStage": "string",
  "status": "string"
}
```

#### Update Product Status (Partial)
```http
PATCH /products/[id]
Content-Type: application/json

{
  "status": "string",
  "currentStage": "string"
}
```

#### Delete Product
```http
DELETE /products/[id]
```

### Semi-Finished

#### List Semi-Finished Items
```http
GET /semi-finished
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "op": "string",
      "batch": "string",
      "quantity_total": "number",
      "quantity_envasado": "number",
      "family": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

#### Create Semi-Finished Item
```http
POST /semi-finished
Content-Type: application/json

{
  "name": "string",
  "op": "string",
  "batch": "string",
  "quantity_total": "number",
  "family": "string"
}
```

#### Update Semi-Finished Item
```http
PUT /semi-finished/[id]
Content-Type: application/json

{
  "name": "string",
  "quantity_envasado": "number"
}
```

#### Delete Semi-Finished Item
```http
DELETE /semi-finished/[id]
```

### Quality Control

#### List Quality Tests
```http
GET /quality
```

#### Create Quality Test
```http
POST /quality
Content-Type: application/json

{
  "productId": "string",
  "testType": "string",
  "result": "string",
  "notes": "string"
}
```

### MOD (Mão de Obra)

#### List MOD Activities
```http
GET /mod/activities
```

#### Create MOD Entry
```http
POST /mod-entry
Content-Type: application/json

{
  "operadorId": "string",
  "produtoCategoria": "GEIS|BASES|ESMALTES|OUTROS",
  "loteOP": "string",
  "quantidadeKg": "number"
}
```

### Statistics

#### Get Production Stats
```http
GET /stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": "number",
    "activeProducts": "number",
    "completedProducts": "number",
    "blockedProducts": "number",
    "productionToday": "number",
    "efficiency": "number"
  }
}
```

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Data Models

### Product
```typescript
interface Product {
  id: string
  name: string
  op: string
  batch: string
  quantity: number
  currentStage: string
  status: 'active' | 'completed' | 'paused' | 'blocked'
  createdAt: string
  updatedAt: string
}
```

### SemiFinished
```typescript
interface SemiFinished {
  id: string
  name: string
  op: string
  batch: string
  quantity_total: number
  quantity_envasado: number
  family: string
  createdAt: string
  updatedAt: string
}
```

### User
```typescript
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'operator'
  permissions: string[]
}
```

## Usage Examples

### JavaScript/TypeScript
```typescript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@bluwe.com.br', password: 'admin123' })
})
const { user, token } = await loginResponse.json()

// Get products
const productsResponse = await fetch('/api/products', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { data: products } = await productsResponse.json()
```

### cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@bluwe.com.br", "password": "admin123"}'

# Get products
curl -X GET http://localhost:3000/api/products \\
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting in production.

## Caching

- Products: 5 minutes
- Semi-finished: 5 minutes  
- Stats: 30 seconds
- Quality tests: 2 minutes

## Development

To run the API locally:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`.
