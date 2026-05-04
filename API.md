# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints (except authentication endpoints) require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": 400
}
```

---

## Authentication

### Register
Create a new tenant and owner account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "tenantName": "My Restaurant"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "tenantId": "uuid"
  }
}
```

### Login
Authenticate and receive access tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "tenantId": "uuid",
      "scope": "TENANT"
    }
  }
}
```

### Refresh Token
Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

---

## Tenants

### List All Tenants
Get all tenants (GLOBAL scope only).

**Endpoint:** `GET /tenants`

**Auth:** GLOBAL scope required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "My Restaurant",
      "slug": "my-restaurant",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get My Tenant
Get own tenant (both scopes).

**Endpoint:** `GET /tenants/me`

**Auth:** Required (both scopes)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Restaurant",
    "slug": "my-restaurant",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Tenant by ID
Get specific tenant (GLOBAL scope only).

**Endpoint:** `GET /tenants/:id`

**Auth:** GLOBAL scope required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Restaurant",
    "slug": "my-restaurant",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Tenant
Create a new tenant (GLOBAL scope only).

**Endpoint:** `POST /tenants`

**Auth:** GLOBAL scope required

**Request Body:**
```json
{
  "name": "New Restaurant",
  "slug": "new-restaurant"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Restaurant",
    "slug": "new-restaurant",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update My Tenant
Update own tenant (both scopes).

**Endpoint:** `PATCH /tenants/me`

**Auth:** Required (both scopes)

**Request Body:**
```json
{
  "name": "Updated Restaurant Name"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Restaurant Name",
    "slug": "my-restaurant",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Tenant by ID
Update specific tenant (GLOBAL scope only).

**Endpoint:** `PATCH /tenants/:id`

**Auth:** GLOBAL scope required

**Request Body:**
```json
{
  "name": "Updated Name",
  "slug": "updated-slug"
}
```

**Response:** `200 OK`

### Delete My Tenant
Delete own tenant (both scopes).

**Endpoint:** `DELETE /tenants/me`

**Auth:** Required (both scopes)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Tenant deleted successfully"
}
```

### Delete Tenant by ID
Delete specific tenant (GLOBAL scope only).

**Endpoint:** `DELETE /tenants/:id`

**Auth:** GLOBAL scope required

**Response:** `200 OK`

---

## Users

### List Users
List all users (GLOBAL: all users, TENANT: own tenant users).

**Endpoint:** `GET /users`

**Auth:** Required (both scopes)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "roleId": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Users by Tenant
List users in specific tenant.

**Endpoint:** `GET /users/tenant/:tenantId`

**Auth:** Required (TENANT users can only access their own tenant)

**Response:** `200 OK`

### Get User by ID
Get specific user.

**Endpoint:** `GET /users/:id`

**Auth:** Required (TENANT users can only access users in their tenant)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "roleId": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create User
Create a new user.

**Endpoint:** `POST /users`

**Auth:** Required (TENANT users can only create in their tenant)

**Request Body:**
```json
{
  "tenantId": "uuid",
  "roleId": "uuid",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "roleId": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update User
Update user details.

**Endpoint:** `PATCH /users/:id`

**Auth:** Required (TENANT users can only update users in their tenant)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "roleId": "uuid",
  "password": "NewPassword123"
}
```

**Response:** `200 OK`

### Delete User
Delete a user.

**Endpoint:** `DELETE /users/:id`

**Auth:** Required (TENANT users can only delete users in their tenant)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Roles

### List Roles
List all roles (GLOBAL: all roles, TENANT: own tenant roles).

**Endpoint:** `GET /roles`

**Auth:** Required (both scopes)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "name": "Manager",
      "scope": "TENANT",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Roles by Tenant
List roles in specific tenant.

**Endpoint:** `GET /roles/tenant/:tenantId`

**Auth:** Required (TENANT users can only access their own tenant)

**Response:** `200 OK`

### Get Role by ID
Get specific role.

**Endpoint:** `GET /roles/:id`

**Auth:** Required (TENANT users can only access roles in their tenant)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Manager",
    "scope": "TENANT",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Role
Create a new role.

**Endpoint:** `POST /roles`

**Auth:** Required (TENANT users can only create TENANT-scoped roles in their tenant)

**Request Body:**
```json
{
  "tenantId": "uuid",
  "name": "Manager",
  "scope": "TENANT",
  "permissionIds": ["uuid1", "uuid2"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Manager",
    "scope": "TENANT",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Role
Update role details.

**Endpoint:** `PATCH /roles/:id`

**Auth:** Required (TENANT users can only update roles in their tenant)

**Request Body:**
```json
{
  "name": "Senior Manager",
  "permissionIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`

### Delete Role
Delete a role.

**Endpoint:** `DELETE /roles/:id`

**Auth:** Required (TENANT users can only delete roles in their tenant)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

---

## Permissions

### List Permissions
List all permissions (both scopes can view).

**Endpoint:** `GET /permissions`

**Auth:** Required (both scopes)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "menu:create",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Permission by ID
Get specific permission.

**Endpoint:** `GET /permissions/:id`

**Auth:** Required (both scopes)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "menu:create",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Permission
Create a new permission (GLOBAL scope only).

**Endpoint:** `POST /permissions`

**Auth:** GLOBAL scope required

**Request Body:**
```json
{
  "name": "custom:permission"
}
```

**Response:** `201 Created`

### Update Permission
Update permission (GLOBAL scope only).

**Endpoint:** `PATCH /permissions/:id`

**Auth:** GLOBAL scope required

**Request Body:**
```json
{
  "name": "updated:permission"
}
```

**Response:** `200 OK`

### Delete Permission
Delete permission (GLOBAL scope only).

**Endpoint:** `DELETE /permissions/:id`

**Auth:** GLOBAL scope required

**Response:** `200 OK`

---

## Categories

### List Categories
List all categories (GLOBAL: all categories, TENANT: own tenant categories).

**Endpoint:** `GET /categories`

**Auth:** Required (both scopes)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "name": "Appetizers",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Categories by Tenant
List categories in specific tenant.

**Endpoint:** `GET /categories/tenant/:tenantId`

**Auth:** Required (TENANT users can only access their own tenant)

**Response:** `200 OK`

### Get Category by ID
Get specific category.

**Endpoint:** `GET /categories/:id`

**Auth:** Required (TENANT users can only access categories in their tenant)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Appetizers",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Category
Create a new category.

**Endpoint:** `POST /categories`

**Auth:** Required (TENANT users can only create in their tenant)

**Request Body:**
```json
{
  "tenantId": "uuid",
  "name": "Appetizers"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Appetizers",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Category
Update category details.

**Endpoint:** `PATCH /categories/:id`

**Auth:** Required (TENANT users can only update categories in their tenant)

**Request Body:**
```json
{
  "name": "Starters"
}
```

**Response:** `200 OK`

### Delete Category
Delete a category.

**Endpoint:** `DELETE /categories/:id`

**Auth:** Required (TENANT users can only delete categories in their tenant)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Menus

### List Menus
List all menus with optional filters (GLOBAL: all menus, TENANT: own tenant menus).

**Endpoint:** `GET /menus`

**Auth:** Required (both scopes)

**Query Parameters:**
- `categoryId` (optional) - Filter by category UUID
- `isAvailable` (optional) - Filter by availability (true/false)

**Examples:**
```
GET /menus
GET /menus?categoryId=uuid
GET /menus?isAvailable=true
GET /menus?categoryId=uuid&isAvailable=true
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "categoryId": "uuid",
      "name": "Caesar Salad",
      "description": "Fresh romaine lettuce with parmesan",
      "price": 1200,
      "imageUrl": "https://example.com/salad.jpg",
      "isAvailable": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Menus by Tenant
List menus in specific tenant.

**Endpoint:** `GET /menus/tenant/:tenantId`

**Auth:** Required (TENANT users can only access their own tenant)

**Response:** `200 OK`

### Get Menus by Category
List menus in specific category.

**Endpoint:** `GET /menus/category/:categoryId`

**Auth:** Required (TENANT users can only access categories in their tenant)

**Response:** `200 OK`

### Get Menu by ID
Get specific menu.

**Endpoint:** `GET /menus/:id`

**Auth:** Required (TENANT users can only access menus in their tenant)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "categoryId": "uuid",
    "name": "Caesar Salad",
    "description": "Fresh romaine lettuce with parmesan",
    "price": 1200,
    "imageUrl": "https://example.com/salad.jpg",
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Menu
Create a new menu item.

**Endpoint:** `POST /menus`

**Auth:** Required (TENANT users can only create in their tenant)

**Request Body:**
```json
{
  "tenantId": "uuid",
  "categoryId": "uuid",
  "name": "Caesar Salad",
  "description": "Fresh romaine lettuce with parmesan cheese and croutons",
  "price": 1200,
  "imageUrl": "https://example.com/salad.jpg",
  "isAvailable": true
}
```

**Validation:**
- `name`: 2-100 characters
- `description`: max 500 characters
- `price`: positive integer (in cents)
- `imageUrl`: valid URL format
- `categoryId`: must exist and belong to same tenant

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "categoryId": "uuid",
    "name": "Caesar Salad",
    "description": "Fresh romaine lettuce with parmesan cheese and croutons",
    "price": 1200,
    "imageUrl": "https://example.com/salad.jpg",
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Menu
Update menu details.

**Endpoint:** `PATCH /menus/:id`

**Auth:** Required (TENANT users can only update menus in their tenant)

**Request Body:**
```json
{
  "name": "Premium Caesar Salad",
  "description": "Premium Caesar with grilled chicken",
  "price": 1500,
  "categoryId": "uuid",
  "imageUrl": "https://example.com/premium-salad.jpg",
  "isAvailable": true
}
```

**Response:** `200 OK`

### Toggle Menu Availability
Quick toggle for menu availability.

**Endpoint:** `PATCH /menus/:id/availability`

**Auth:** Required (TENANT users can only update menus in their tenant)

**Request Body:**
```json
{
  "isAvailable": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "categoryId": "uuid",
    "name": "Caesar Salad",
    "description": "Fresh romaine lettuce with parmesan",
    "price": 1200,
    "imageUrl": "https://example.com/salad.jpg",
    "isAvailable": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Bulk Update Menu Availability
Update availability for multiple menus at once.

**Endpoint:** `PATCH /menus/bulk/availability`

**Auth:** Required (TENANT users: all menus must belong to their tenant)

**Request Body:**
```json
{
  "menuIds": ["uuid1", "uuid2", "uuid3"],
  "isAvailable": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid1",
      "tenantId": "uuid",
      "categoryId": "uuid",
      "name": "Menu 1",
      "isAvailable": true,
      ...
    },
    {
      "id": "uuid2",
      "tenantId": "uuid",
      "categoryId": "uuid",
      "name": "Menu 2",
      "isAvailable": true,
      ...
    }
  ]
}
```

### Delete Menu
Delete a menu item.

**Endpoint:** `DELETE /menus/:id`

**Auth:** Required (TENANT users can only delete menus in their tenant)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Menu deleted successfully"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

---

## Scope-Based Access

### GLOBAL Scope
- Can access all resources across all tenants
- Can create, update, delete any resource
- Can create GLOBAL and TENANT scoped roles
- Can create and modify permissions

### TENANT Scope
- Can only access resources in their own tenant
- Automatically filtered by `tenantId`
- Can create TENANT-scoped roles only
- Can view but not create/modify permissions
- Cannot access other tenants' data

---

## Common Use Cases

### Restaurant Owner Workflow

1. **Register**
```bash
POST /auth/register
{
  "name": "John Doe",
  "email": "john@restaurant.com",
  "password": "SecurePass123",
  "tenantName": "My Restaurant"
}
```

2. **Login**
```bash
POST /auth/login
{
  "email": "john@restaurant.com",
  "password": "SecurePass123"
}
```

3. **Create Categories**
```bash
POST /categories
{
  "tenantId": "<your-tenant-id>",
  "name": "Appetizers"
}
```

4. **Create Menu Items**
```bash
POST /menus
{
  "tenantId": "<your-tenant-id>",
  "categoryId": "<category-id>",
  "name": "Caesar Salad",
  "description": "Fresh salad",
  "price": 1200,
  "imageUrl": "https://example.com/salad.jpg",
  "isAvailable": true
}
```

5. **Create Staff Role**
```bash
POST /roles
{
  "tenantId": "<your-tenant-id>",
  "name": "Waiter",
  "scope": "TENANT",
  "permissionIds": ["<perm-id-1>", "<perm-id-2>"]
}
```

6. **Add Staff User**
```bash
POST /users
{
  "tenantId": "<your-tenant-id>",
  "roleId": "<waiter-role-id>",
  "name": "Jane Smith",
  "email": "jane@restaurant.com",
  "password": "SecurePass456"
}
```

### Daily Operations

**Toggle Menu Availability (Sold Out)**
```bash
PATCH /menus/<menu-id>/availability
{
  "isAvailable": false
}
```

**Bulk Disable Breakfast Items**
```bash
PATCH /menus/bulk/availability
{
  "menuIds": ["breakfast-1", "breakfast-2", "breakfast-3"],
  "isAvailable": false
}
```

**Filter Available Menus by Category**
```bash
GET /menus?categoryId=<appetizers-id>&isAvailable=true
```

---

## Rate Limiting
Currently no rate limiting is implemented. Consider implementing rate limiting in production.

## Pagination
Currently no pagination is implemented. All list endpoints return all matching records. Consider implementing pagination for production use.

## CORS
CORS is configured to allow requests from the origin specified in `CORS_ORIGIN` environment variable.

Allowed methods: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`
