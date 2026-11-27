Save the following as `AGENTS.md` in your project root.

markdown

````markdown

# AGENTS.md

# Bean Scene Ordering System – REST API

## 1. Project Overview

The Bean Scene Ordering System is a REST API designed to support an Android tablet application for restaurant staff.

The API allows staff to securely log in, browse and search menu items, and create and manage customer orders associated with restaurant tables. Managers have additional permissions to manage menu items, categories, staff accounts and view order activity reports.

The project is a university assignment and learning project. Prioritise clear, maintainable and understandable code over unnecessary complexity.

### Core Features

- **Menu items:** View, search, create, update and delete menu items, including descriptions, prices, photos, dietary requirements, allergens and availability.
- **Menu categories:** Browse, create, update and delete menu categories.
- **Orders:** Create, view and manage orders, including ordered items, dietary requirements, special requests, notes, timestamps and order status.
- **Table management:** Associate orders with restaurant tables.
- **Staff authentication:** Secure login using JWT authentication.
- **Staff management:** Managers can create, update and delete staff accounts.
- **Order reports:** Managers can view order activity, including in-progress and completed orders.
- **Offline support:** Support local menu caching by the Android application. The API should provide the necessary menu data and allow efficient retrieval.
- **Security:** Enforce authentication and role-based authorisation across protected endpoints.

## 2. Technology Stack

Use the following technologies:

- **Runtime:** Node.js (LTS)
- **Language:** TypeScript
- **Framework:** Express
- **Database:** MongoDB (localhost:27017)
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **API documentation:** Swagger / OpenAPI
- **Package manager:** npm

Use ES Modules and enable TypeScript strict mode.

Avoid introducing additional dependencies unless they provide clear value.

## 3. Architecture

Follow a layer-based architecture with clear separation of responsibilities.

Suggested project structure:

```text
src/
├── config/           # Application and database configuration
├── controllers/      # Handle HTTP requests and responses
├── services/         # Business logic
├── repositories/     # Database operations
├── models/           # Mongoose schemas and models
├── routes/           # API route definitions
├── middleware/       # Authentication, authorisation and error handling
├── validators/       # Request validation schemas
├── types/            # Shared TypeScript types and interfaces
├── utils/            # Shared helper functions
├── docs/             # Swagger/OpenAPI documentation
├── app.ts            # Express application configuration
└── server.ts         # Application entry point
```

### Layer Responsibilities

- **Routes:** Define endpoints and connect middleware to controllers.
- **Controllers:** Handle requests, invoke services and return HTTP responses. Keep controllers thin.
- **Services:** Implement business logic and enforce business rules.
- **Repositories:** Handle database queries and persistence.
- **Models:** Define Mongoose schemas, field types, indexes and schema validation.
- **Middleware:** Handle authentication, authorisation, validation and errors.
- **Validators:** Validate incoming request data before it reaches business logic.

Maintain separation between layers. Avoid putting business logic in controllers or database queries directly in routes.

## 4. Coding Standards

- Use TypeScript throughout the application.
- Enable and maintain TypeScript strict mode.
- Prefer explicit types and interfaces over `any`.
- Use `async/await` for asynchronous operations.
- Use meaningful, descriptive variable, function and class names.
- Keep functions and methods focused on a single responsibility.
- Avoid unnecessary code duplication.
- Add comments where they clarify complex logic or important decisions.
- Use Australian English in code comments, documentation and user-facing messages.
- Follow consistent formatting and naming conventions.
- Do not introduce unnecessary abstractions or over-engineering.

## 5. REST API Conventions

- Prefix all API endpoints with `/api/v1`.
- Use standard HTTP methods appropriately:
  - `GET`: Retrieve resources.
  - `POST`: Create resources.
  - `PUT`: Replace resources.
  - `PATCH`: Partially update resources.
  - `DELETE`: Delete resources.
- Use appropriate HTTP status codes.
- Return consistent JSON response structures.
- Provide clear, meaningful success and error messages.
- Implement pagination, filtering and sorting for relevant collection endpoints.
- Use appropriate resource naming conventions (plural nouns).
- Avoid exposing internal database implementation details in API responses.

### Response Structure

Use a consistent response format.

Successful response example:

```json
{
  "success": true,
  "message": "Menu item retrieved successfully",
  "data": {}
}
```

Error response example:

```json
{
  "success": false,
  "message": "Menu item not found",
  "errors": []
}
```

For paginated responses, include pagination metadata alongside the returned data.

## 6. Database and Mongoose

- Use Mongoose schemas and models for database interaction.
- Apply appropriate Mongoose schema validation.
- Define required fields, data types, defaults and constraints.
- Use references where appropriate to establish relationships between documents.
- Use appropriate indexes to support frequently queried fields.
- Avoid unnecessary database queries.
- Use `lean()` for read-only queries where appropriate.
- Handle missing documents and database errors consistently.
- Never expose password hashes or other sensitive fields in API responses.
- Do not store redundant information unless required by a clear business need.

## 7. Authentication and Authorisation

Use JWT-based authentication for protected endpoints.

### User Roles

**Staff**

- Log in and authenticate.
- Browse and search menu items.
- View menu categories.
- Create customer orders.
- View and manage permitted orders.
- Update order statuses where permitted.

**Manager**

- Inherits all standard staff permissions.
- Create, update and delete menu items.
- Create, update and delete menu categories.
- Create, update and delete staff accounts.
- Access order activity reports.

### Security Rules

- Hash passwords using bcrypt before storing them.
- Never store plaintext passwords.
- Verify JWTs through authentication middleware.
- Apply role-based authorisation middleware to protected endpoints.
- Never rely on frontend permissions alone.
- Validate permissions on every protected request.
- Prevent users from modifying their own role or escalating privileges.
- Never return password hashes or JWT secrets.
- Store secrets and credentials in environment variables.

## 8. Validation and Error Handling

- Validate all incoming user input.
- Validate request parameters, query parameters and request bodies.
- Use dedicated validation schemas where appropriate.
- Apply Mongoose validation as an additional layer of protection.
- Never rely exclusively on database validation.
- Return meaningful validation error messages.
- Use centralised Express error-handling middleware.
- Handle asynchronous errors consistently.
- Avoid exposing stack traces, internal errors or sensitive information to clients.
- Handle common errors, including:
  - Invalid request data (400).
  - Unauthenticated requests (401).
  - Unauthorised requests (403).
  - Missing resources (404).
  - Duplicate resources (409).
  - Unexpected server errors (500).

## 9. Testing and Verification

This is a learning project. Do not introduce unit testing or require automated database tests.

Testing approach:

- Manually test database operations using the local MongoDB instance.
- Use HTTP endpoint tests to verify API behaviour.
- Verify successful responses, validation errors and expected failure cases.
- Test authentication and role-based authorisation.
- Test relevant CRUD operations.
- Verify that staff cannot access manager-only functionality.
- Verify that managers can access both staff and manager functionality.
- Use an API client such as Postman or Thunder Client for HTTP testing.
- Do not modify or delete existing local database data during testing without explicit permission.

## 10. Security

- Validate and sanitise user input.
- Protect against NoSQL injection.
- Prevent mass-assignment vulnerabilities by explicitly selecting permitted fields.
- Apply appropriate CORS configuration.
- Use secure HTTP headers.
- Never commit `.env` files, credentials or secrets.
- Avoid returning sensitive information in API responses.
- Enforce authentication and authorisation consistently.
- Apply appropriate safeguards to password and account management endpoints.

## 11. API Documentation

- Maintain Swagger/OpenAPI documentation for all API endpoints.
- Document endpoint paths, HTTP methods and descriptions.
- Document required parameters and request bodies.
- Document successful responses and possible error responses.
- Document authentication requirements.
- Document role-based access restrictions.
- Keep API documentation updated whenever endpoints or response structures change.

## 12. Git and Commit Conventions

- Make small, focused commits.
- Follow Conventional Commits.

Examples:

- `feat: add menu item endpoints`
- `feat: implement JWT authentication`
- `fix: correct order status validation`
- `refactor: separate order business logic`
- `docs: update Swagger documentation`
- `chore: configure TypeScript`

- Avoid committing unrelated changes together.
- Do not overwrite or discard existing user changes.
- Never commit secrets, credentials or local environment files.

## 13. Environment Configuration

Use environment variables for configuration and sensitive values.

Maintain a `.env.example` file containing required variable names and non-sensitive example values.

Typical configuration:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bean-scene
JWT_SECRET=
JWT_EXPIRES_IN=
```

Validate required environment variables during application startup.

## 14. Instructions for AI Agents

When working on this project:

1. Read this file before making changes.
2. Inspect the existing project structure and code before implementing new functionality.
3. Follow the established layer-based architecture.
4. Reuse existing patterns and utilities where appropriate.
5. Do not introduce unnecessary dependencies or architectural complexity.
6. Validate all user input and enforce appropriate authorisation.
7. Keep controllers thin and business logic in services.
8. Handle errors consistently using centralised error-handling middleware.
9. Update Swagger documentation when modifying API endpoints.
10. Verify TypeScript compilation and relevant HTTP endpoint behaviour after making changes.
11. Do not introduce unit testing frameworks or automated database tests.
12. Do not modify existing database records or user changes without permission.
13. Explain significant implementation decisions when they help understanding.
14. Prefer straightforward, readable solutions that demonstrate sound software engineering principles.

**General rule:** Prioritise correctness, security, consistency and maintainability while keeping implementations appropriate for a university-level learning project.
````