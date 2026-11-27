# Bean Scene Ordering System - Product Requirements Document

## 1. Document Purpose

This document defines the complete initial requirements for the Bean Scene Ordering System REST API. It supplements the project constitution in `AGENTS.md` and is intended to be sufficient for implementation and acceptance testing.

## 2. Product Summary

The Bean Scene Ordering System is an Express REST API supporting an Android tablet application used by restaurant staff.

The API provides:

- Staff login and JWT-based authentication.
- Staff account management for managers.
- Menu category and menu item management.
- Menu search and filtering.
- Table management.
- Customer order creation and status management.
- Manager order activity reports.
- Versioned menu data for Android caching.
- Swagger/OpenAPI documentation.

The project is a TypeScript, Node.js, Express, MongoDB and Mongoose learning project. Implementations should remain clear, maintainable and appropriately scoped.

## 3. Goals

1. Allow authenticated staff to browse the menu and create and manage permitted orders.
2. Allow managers to manage staff, categories, menu items and tables.
3. Associate customer orders with restaurant tables and responsible staff.
4. Provide predictable order status transitions.
5. Provide in-progress and completed order reports to managers.
6. Support Android menu caching with a versioned snapshot and ETag revalidation.
7. Enforce authentication, authorisation, validation and secure data handling.
8. Provide consistent, documented HTTP responses.

## 4. Non-goals

The initial API does not require:

- Customer-facing accounts or public ordering.
- Payment processing or accounting integration.
- Refresh tokens or server-managed login sessions.
- Revenue, popularity or payroll reporting.
- Real-time WebSocket or push notifications.
- Automated unit testing infrastructure.
- Object storage, image upload or image processing.
- Multi-restaurant or tenant management.
- Online/offline transaction synchronisation beyond menu snapshot caching.

## 5. Roles and Permissions

### 5.1 Staff

Staff can:

- Log in.
- Browse and search menu items.
- Browse menu categories.
- View tables.
- Create orders.
- View orders.
- Edit or cancel orders they created, provided the order is not completed or cancelled.
- Update order status where the transition is valid.

### 5.2 Manager

Managers inherit all staff permissions and can:

- Create, retrieve, update and delete staff accounts.
- Create, retrieve, update and delete menu categories.
- Create, retrieve, update and delete menu items.
- Create, retrieve, update and delete tables.
- Edit or cancel any order, provided the order is not completed or cancelled.
- Update order status using valid transitions.
- Access order activity reports.

### 5.3 Permission Restrictions

- A staff member must not change their own role.
- A staff member must not grant themselves or another staff member manager access.
- A staff member must not edit or cancel an order created by another staff member.
- Completed and cancelled orders are immutable.
- Manager-only endpoints must reject unauthenticated and staff requests.

## 6. Core User Journeys

### 6.1 Staff Login

1. Staff submits their email and password.
2. The API validates the request and credentials.
3. A short-lived JWT is returned on success.
4. The JWT identifies the staff account and role for protected requests.

### 6.2 Browse the Menu

1. Staff retrieves menu categories and menu items.
2. Staff may search and filter menu items.
3. The Android application may request the versioned menu snapshot.

### 6.3 Place an Order

1. Staff selects an available table.
2. Staff adds menu items and quantities.
3. Staff supplies optional dietary requirements, special requests and notes.
4. The API validates the table, menu items and order data.
5. The API creates the order in `Placed` status.

### 6.4 Manage an Order

1. Staff retrieves an active order.
2. Staff may update permitted order details.
3. Staff or managers may apply valid status transitions.
4. The API records completion time when status becomes `Completed`.
5. Terminal orders cannot be edited or cancelled.

### 6.5 Manager Administration

1. A manager creates or updates staff accounts.
2. A manager maintains menu categories and items.
3. A manager maintains restaurant tables.
4. A manager retrieves filtered order reports.

## 7. Technology and Architecture

### 7.1 Required Technology

- Node.js LTS.
- TypeScript with strict mode enabled.
- Express.
- MongoDB on `mongodb://localhost:27017`.
- Mongoose.
- JWT authentication.
- bcrypt password hashing.
- npm.
- Swagger/OpenAPI.
- ES Modules.

### 7.2 Architecture

The API must use separated layers:

- Routes: endpoint definitions and middleware composition.
- Controllers: HTTP handling and thin response mapping.
- Services: business logic and authorisation rules.
- Repositories: database operations.
- Models: Mongoose schemas and database validation.
- Middleware: authentication, authorisation, validation and errors.
- Validators: request validation schemas.
- Types: shared TypeScript interfaces.
- Utils: shared helpers.
- Docs: Swagger/OpenAPI documentation.

## 8. Shared API Conventions

### 8.1 Base Path

All endpoints must begin with `/api/v1`.

### 8.2 HTTP Methods

- `GET`: retrieve resources.
- `POST`: create resources or perform actions.
- `PUT`: replace resources.
- `PATCH`: partially update resources.
- `DELETE`: remove resources.

### 8.3 Success Response

Successful responses must use:

```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": {}
}
```

### 8.4 Error Response

Error responses must use:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": []
}
```

Errors must not expose stack traces, passwords, password hashes or JWT secrets.

### 8.5 Pagination

Relevant collection endpoints must accept:

- `page`: positive integer, default `1`.
- `limit`: positive integer, default `20`, maximum `50`.

Paginated response data must include:

```json
{
  "success": true,
  "message": "Resources retrieved successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 8.6 Sorting and Filtering

Collection endpoints must reject unsupported sort fields, unsupported filter fields and unknown query parameters.

Sort values must be explicit, for example `sort=name` or `sort=-price`. Sorting direction must be documented per endpoint.

### 8.7 Validation

- Validate request parameters, query parameters and request bodies.
- Reject unknown fields in request bodies.
- Apply both schema validation and Mongoose validation.
- Return 400 for malformed or invalid input.
- Reject duplicate resources with 409 where uniqueness is defined.

## 9. Authentication Requirements

FR-AUTH-001: `POST /api/v1/auth/login` must authenticate a staff account by email and password.

FR-AUTH-002: Login must return 401 for unknown emails or invalid passwords.

FR-AUTH-003: Login must return a short-lived access JWT containing the staff ID and role.

FR-AUTH-004: Login must enforce the configured JWT expiry.

FR-AUTH-005: `POST /api/v1/auth/logout` must be available and return a successful response. Logout is stateless because server-managed sessions and refresh tokens are out of scope.

FR-AUTH-006: Protected endpoints must require a valid bearer JWT.

FR-AUTH-007: Missing or invalid JWTs must return 401.

FR-AUTH-008: Valid JWTs for users without sufficient privileges must return 403.

FR-AUTH-009: Login attempts must be rate-limited.

FR-AUTH-010: JWT secrets and expiry values must come from environment variables.

## 10. Staff Account Requirements

### 10.1 Staff Fields

Each staff account contains:

- Name: required, non-empty.
- Email: required, valid format and unique.
- Password: write-only at create/update operations.
- Role: required, one of `staff` or `manager`.

Password hashes must never be returned.

### 10.2 Password Policy

Passwords must:

- Contain at least eight characters.
- Contain at least one letter.
- Contain at least one number.

### 10.3 Staff Endpoints

- `GET /api/v1/staff`: manager only, paginated.
- `POST /api/v1/staff`: manager only, create account.
- `GET /api/v1/staff/:id`: manager only.
- `PUT /api/v1/staff/:id`: manager only, replace permitted account fields.
- `PATCH /api/v1/staff/:id`: manager only, partially update permitted account fields.
- `DELETE /api/v1/staff/:id`: manager only.

FR-STAFF-001: Creating duplicate email addresses must return 409.

FR-STAFF-002: Updating an account must validate email uniqueness.

FR-STAFF-003: Managers must not be able to remove their own role through an account update.

FR-STAFF-004: Staff account deletion must be prevented if deleting the account would leave no manager account.

FR-STAFF-005: Referenced staff accounts must not be hard deleted if account history would become invalid.

FR-STAFF-006: Password updates must hash the new password using bcrypt.

FR-STAFF-007: Staff responses must omit password hashes.

## 11. Menu Category Requirements

### 11.1 Category Fields

Each category contains:

- Name: required, non-empty and unique.
- Description: optional.

### 11.2 Category Endpoints

- `GET /api/v1/categories`: authenticated, paginated.
- `POST /api/v1/categories`: manager only.
- `GET /api/v1/categories/:id`: authenticated.
- `PUT /api/v1/categories/:id`: manager only.
- `PATCH /api/v1/categories/:id`: manager only.
- `DELETE /api/v1/categories/:id`: manager only.

FR-CAT-001: Duplicate category names must return 409.

FR-CAT-002: A category cannot be hard deleted while referenced by menu items.

FR-CAT-003: Categories must support sorting by name.

## 12. Menu Item Requirements

### 12.1 Menu Item Fields

Each menu item contains:

- Name: required, non-empty.
- Description: optional.
- Price: required, non-negative decimal.
- Category: required category reference.
- Photo URL: optional string.
- Allergens: array of category/tag values and free-text notes.
- Dietary requirements: array of category/tag values and free-text notes.
- Availability: required boolean.

Allergen and dietary structures must use a tag/category list and optional free-text notes.

### 12.2 Menu Item Endpoints

- `GET /api/v1/menu-items`: authenticated, paginated and searchable.
- `GET /api/v1/menu-items/snapshot`: authenticated.
- `POST /api/v1/menu-items`: manager only.
- `GET /api/v1/menu-items/:id`: authenticated.
- `PUT /api/v1/menu-items/:id`: manager only.
- `PATCH /api/v1/menu-items/:id`: manager only.
- `DELETE /api/v1/menu-items/:id`: manager only.

FR-MENU-001: Menu item name and description must support case-insensitive search.

FR-MENU-002: Menu items must support category, dietary requirement, allergen and availability filters.

FR-MENU-003: Menu items must support sorting by name, price and category.

FR-MENU-004: Invalid category references must return 400 or 404.

FR-MENU-005: Negative prices must return 400.

FR-MENU-006: A menu item cannot be hard deleted while referenced by existing order history.

FR-MENU-007: Photo data must be stored as a URL string; multipart upload and object storage are out of scope.

FR-MENU-008: Availability changes must be reflected in menu collections and snapshots.

## 13. Table Requirements

### 13.1 Table Fields

Each table contains:

- Table number: required and unique.
- Section: required, non-empty.
- Capacity: required, positive integer.
- Status: required; `Available`, `Occupied`, `Reserved` or `Out of service`.

### 13.2 Table Endpoints

- `GET /api/v1/tables`: authenticated, paginated.
- `POST /api/v1/tables`: manager only.
- `GET /api/v1/tables/:id`: authenticated.
- `PUT /api/v1/tables/:id`: manager only.
- `PATCH /api/v1/tables/:id`: manager only.
- `DELETE /api/v1/tables/:id`: manager only.

FR-TABLE-001: Duplicate table numbers must return 409.

FR-TABLE-002: A table can have only one active order at a time.

FR-TABLE-003: Creating an order must require the table status to be `Available`. `Occupied`, `Reserved` and `Out of service` tables must reject order creation.

FR-TABLE-004: A table cannot be hard deleted while referenced by order history.

FR-TABLE-005: When an order is completed or cancelled, the table becomes `Available` only if no other active order exists for that table.

FR-TABLE-006: Creating a `Placed` order must prevent another active order on the same table.

## 14. Order Requirements

### 14.1 Order Fields

Each order contains:

- Table reference: required.
- Created by: required staff reference.
- Created timestamp: required server-generated timestamp.
- Status: required, valid order status.
- Special request: optional.
- Notes: optional.
- Completion timestamp: optional.
- Ordered items: required, at least one item.

### 14.2 Ordered Item Fields

Each ordered item contains:

- Menu item reference: required.
- Quantity: required, positive integer.
- Unit-price snapshot: required server-derived menu price.
- Line subtotal: server-derived quantity multiplied by unit price.
- Dietary requirements: optional array/category tags and free-text notes.
- Special request: optional.
- Note: optional.

FR-ORDER-001: Order creation must use current menu prices as unit-price snapshots.

FR-ORDER-002: The client must not supply unit prices or line subtotals.

FR-ORDER-003: Invalid, unavailable or missing menu item references must return 400 or 404.

FR-ORDER-004: An order must contain at least one ordered item.

FR-ORDER-005: Quantities must be positive integers.

FR-ORDER-006: The order is created in `Placed` status.

FR-ORDER-007: The created-by user is derived from the authenticated JWT.

FR-ORDER-008: The client must not supply created-by or created timestamps.

### 14.3 Order Endpoints

- `GET /api/v1/orders`: authenticated, paginated and filtered.
- `POST /api/v1/orders`: authenticated staff or manager.
- `GET /api/v1/orders/:id`: authenticated with permission rules.
- `PATCH /api/v1/orders/:id`: permitted staff or manager.
- `PATCH /api/v1/orders/:id/status`: permitted staff or manager.
- `POST /api/v1/orders/:id/cancel`: permitted staff or manager.
- `DELETE /api/v1/orders/:id`: not available in the initial API.

FR-ORDER-009: Staff may view all order records, but may edit or cancel only orders they created.

FR-ORDER-010: Managers may retrieve and edit any non-terminal order.

FR-ORDER-011: A staff member cannot edit or cancel another user's order.

FR-ORDER-012: Completed and cancelled orders are immutable.

FR-ORDER-013: Order updates must allow table reference, ordered items, special request and notes only while the order is active.

FR-ORDER-014: Order updates must not allow arbitrary status changes outside status endpoint rules.

FR-ORDER-015: Cancelled orders require no cancellation reason field; cancellation is a status transition.

## 15. Order Status Requirements

FR-STATUS-001: Supported statuses are `Placed`, `Preparing`, `Ready`, `Completed` and `Cancelled`.

FR-STATUS-002: Allowed transitions are:

- `Placed -> Preparing`
- `Preparing -> Ready`
- `Ready -> Completed`
- `Placed -> Cancelled`
- `Preparing -> Cancelled`
- `Ready -> Cancelled`

FR-STATUS-003: Backwards transitions are not allowed.

FR-STATUS-004: `Placed -> Ready`, `Preparing -> Completed` and all transitions from terminal statuses are invalid.

FR-STATUS-005: Terminal statuses are `Completed` and `Cancelled`.

FR-STATUS-006: Setting `Completed` must set a completion timestamp.

FR-STATUS-007: Cancelled and completed orders must not accept detail or status updates.

FR-STATUS-008: Invalid transitions must return 409.

FR-STATUS-009: Both staff and managers may perform valid transitions on permitted orders.

## 16. Report Requirements

FR-REPORT-001: Reports are manager-only.

FR-REPORT-002: Reports must provide counts of in-progress and completed orders.

FR-REPORT-003: The report endpoint must support date range filtering.

FR-REPORT-004: The report endpoint must support staff member filtering.

FR-REPORT-005: The report endpoint must support table filtering.

FR-REPORT-006: The report endpoint must support status filtering.

FR-REPORT-007: The initial reports must not include revenue, popularity or other unapproved metrics.

Suggested endpoint:

- `GET /api/v1/reports/orders`

Suggested response shape:

```json
{
  "success": true,
  "message": "Order report retrieved successfully",
  "data": {
    "inProgressCount": 0,
    "completedCount": 0,
    "matchingOrderCount": 0,
    "orders": []
  }
}
```

## 17. Offline Menu Snapshot Requirements

FR-CACHE-001: The API must provide a versioned menu snapshot endpoint.

Suggested endpoint:

- `GET /api/v1/menu-items/snapshot`

FR-CACHE-002: The snapshot must contain categories and available menu items in a consistent representation.

FR-CACHE-003: The snapshot must include a server-generated version identifier.

FR-CACHE-004: `GET` responses must include an ETag header.

FR-CACHE-005: Requests with a matching `If-None-Match` header must return `304 Not Modified` when the snapshot is unchanged.

FR-CACHE-006: Snapshot responses must include appropriate `Cache-Control` headers.

FR-CACHE-007: Changes to categories, menu items or availability must produce a new snapshot version.

FR-CACHE-008: Snapshot payloads must not expose staff, order or credential data.

## 18. Data Deletion Policy

FR-DELETE-001: Menu items, categories and staff accounts use hard deletion unless a reference restriction prevents deletion.

FR-DELETE-002: Categories referenced by menu items must not be deleted.

FR-DELETE-003: Menu items referenced by orders must not be deleted.

FR-DELETE-004: Staff accounts referenced by orders must not be deleted.

FR-DELETE-005: Tables referenced by orders must not be deleted.

FR-DELETE-006: Deletion of a referenced resource must return 409.

FR-DELETE-007: Other referenced resources may be deleted only if no historical reference is broken.

## 19. Security Requirements

FR-SEC-001: Passwords must use bcrypt hashing.

FR-SEC-002: Plaintext passwords must not be stored or returned.

FR-SEC-003: JWT verification must occur through authentication middleware.

FR-SEC-004: Manager permissions must be enforced server-side.

FR-SEC-005: Mass assignment is prohibited; only validated fields may be stored.

FR-SEC-006: NoSQL query values must be validated or sanitised.

FR-SEC-007: CORS must allow configured Android/app origins and development origins.

FR-SEC-008: Production CORS configuration must not allow arbitrary origins.

FR-SEC-009: Secure HTTP headers must be applied.

FR-SEC-010: Environment variables must contain credentials and JWT secrets.

FR-SEC-011: `.env` files must not be committed.

FR-SEC-012: Login attempts must be rate-limited.

## 20. Environment Configuration

The API must support the following environment variables:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bean-scene
JWT_SECRET=
JWT_EXPIRES_IN=
INITIAL_MANAGER_NAME=
INITIAL_MANAGER_EMAIL=
INITIAL_MANAGER_PASSWORD=
CORS_ALLOWED_ORIGINS=
```

FR-ENV-001: Required environment variables must be validated at startup.

FR-ENV-002: A single initial manager must be seeded from the configured environment variables.

FR-ENV-003: Seed creation must be idempotent.

FR-ENV-004: The seed process must not overwrite an existing account with the same email.

## 21. Error and Status Code Requirements

| Status | Use |
|---|---|
| 200 | Successful retrieval or update |
| 201 | Successful creation |
| 204 | Successful deletion, if no response body is used |
| 304 | Snapshot unchanged for matching ETag |
| 400 | Invalid request data or unknown fields |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but insufficient permission |
| 404 | Resource not found |
| 409 | Duplicate resource or invalid state transition |
| 500 | Unexpected server error |

FR-ERR-001: Validation errors must identify fields and messages.

FR-ERR-002: Database duplicate key errors must return a meaningful 409 response.

FR-ERR-003: Unexpected errors must return a generic 500 response.

FR-ERR-004: Asynchronous Express errors must pass through centralised error handling.

## 22. Swagger/OpenAPI Requirements

FR-DOC-001: Swagger/OpenAPI documentation must cover all API endpoints.

FR-DOC-002: Documentation must describe HTTP methods, paths, parameters and request bodies.

FR-DOC-003: Documentation must describe authentication requirements.

FR-DOC-004: Documentation must identify manager-only endpoints.

FR-DOC-005: Documentation must include success and relevant error responses.

FR-DOC-006: Documentation must describe response envelopes and pagination metadata.

FR-DOC-007: Documentation must describe menu snapshot ETag behaviour.

## 23. Non-functional Requirements

- Use Australian English in comments, documentation and user-facing messages.
- Maintain strict TypeScript compilation.
- Keep functions focused and controllers thin.
- Avoid unnecessary dependencies and abstractions.
- Use `lean()` for read-only database queries where appropriate.
- Use indexes for frequently queried fields such as staff email, category name, menu category, menu availability and order status/table.
- Keep API startup clear and provide a centralised health or root response if used by the project.
- Manual HTTP and database verification is the required testing approach.
- Do not introduce automated unit testing frameworks or database tests.

## 24. Acceptance Criteria

The implementation is accepted when:

1. The API starts against local MongoDB with validated environment configuration.
2. One initial manager account is seeded idempotently.
3. Staff can log in and receive a valid JWT.
4. Protected endpoints reject missing or invalid JWTs.
5. Staff cannot access manager-only endpoints.
6. Managers can create, update and delete permitted staff accounts, categories, menu items and tables.
7. Managers cannot delete resources that would break historical references.
8. Menu items support search, filtering and sorting.
9. Menu item availability is represented correctly.
10. Tables support all required statuses and unique table numbers.
11. One table cannot have two active orders.
12. Orders contain server-derived price snapshots and line subtotals.
13. Staff can update only their own active orders.
14. Managers can update any active order.
15. Completed and cancelled orders are immutable.
16. Status transitions follow the defined lifecycle and reject invalid transitions with 409.
17. Completing an order records completion time.
18. Cancelling an order moves it to `Cancelled`.
19. Manager reports show in-progress and completed counts with supported filters.
20. Menu snapshot requests support versioning, ETag and `304 Not Modified`.
21. Unknown fields and invalid pagination, filtering or sort values are rejected.
22. Responses use the required success and error structures.
23. Swagger/OpenAPI documents all endpoints and permission rules.
24. Password hashes and secrets are never exposed.

## 25. Out of Scope

- Refresh tokens.
- Server-side sessions.
- Revenue, popularity or profitability reports.
- Payment processing.
- Customer accounts.
- Push notifications.
- WebSockets.
- Image uploads.
- External image storage.
- Automated test suites.
- Multi-tenant restaurants.
- Offline order synchronisation.

## 26. Implementation Assumption

Unless a later requirement overrides it, menu item description is optional. The exact dietary requirement and allergen tag enums may be implementation-defined, provided they support category/tag values plus free-text notes and are validated consistently.
