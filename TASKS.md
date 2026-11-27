# Bean Scene Ordering System - Implementation Tasks

## 1. Execution Order

Tasks are ordered by implementation dependency and priority:

1. Establish project configuration and shared infrastructure.
2. Implement authentication and staff accounts.
3. Implement menu categories and menu items.
4. Implement tables and order management.
5. Implement reports and menu caching.
6. Complete Swagger documentation and manual verification.

## 2. Project Setup

### T001 - Initialise the Node.js and TypeScript project

Status: Complete

Priority: P0
Dependencies: None

- Initialise npm with ES Modules.
- Add TypeScript strict configuration.
- Add the required Express application dependencies.
- Establish the `src/` project structure defined in `AGENTS.md`.
- Add application entry points.

Acceptance:

- The project installs dependencies successfully.
- TypeScript compiles without errors.
- The application starts through a documented npm command.

### T002 - Add environment configuration

Status: Complete

Priority: P0
Dependencies: T001

- Add `.env.example`.
- Validate required environment variables at startup.
- Configure port, MongoDB URI, JWT secret, JWT expiry and CORS origins.
- Add initial-manager seed values.

Required variables:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `INITIAL_MANAGER_NAME`
- `INITIAL_MANAGER_EMAIL`
- `INITIAL_MANAGER_PASSWORD`
- `CORS_ALLOWED_ORIGINS`

Acceptance:

- Missing required configuration prevents startup with a clear message.
- `.env` is excluded from version control.

### T003 - Configure MongoDB and application infrastructure

Status: Complete

Priority: P0
Dependencies: T001, T002

- Connect Mongoose to the configured local MongoDB URI.
- Configure centralised asynchronous error handling.
- Add request JSON parsing.
- Configure CORS using configured origins.
- Apply secure HTTP headers.
- Add a consistent success and error response format.

Acceptance:

- MongoDB connection succeeds when available.
- Invalid configuration and database failures are handled clearly.
- All API errors use the PRD response envelope.

### T004 - Create shared models and validation infrastructure

Status: Complete

Priority: P0
Dependencies: T001, T003

- Define shared TypeScript types.
- Create validation helpers.
- Reject unknown request-body fields.
- Define consistent pagination and sort query validation.
- Add shared not-found, conflict and validation errors.

Acceptance:

- Unknown fields return 400.
- Invalid IDs return 404 or 400 as appropriate.
- Pagination defaults to page 1 and limit 20.
- Limit values above 50 are rejected.

## 3. Authentication

### T005 - Implement staff data model

Status: Complete

Priority: P0
Dependencies: T003

- Create the staff Mongoose schema.
- Add name, email, password hash and role fields.
- Add email uniqueness.
- Restrict roles to `staff` and `manager`.
- Add appropriate indexes.

Acceptance:

- Plaintext passwords are never stored.
- Duplicate emails are enforced.
- Password hashes are excluded from API responses.

### T006 - Add password and JWT utilities

Status: Complete

Priority: P0
Dependencies: T005

- Implement bcrypt password hashing.
- Implement password comparison.
- Implement JWT signing and verification.
- Apply the password policy:
  - Minimum eight characters.
  - At least one letter.
  - At least one number.

Acceptance:

- Valid passwords are hashed.
- Invalid passwords are rejected.
- JWT payload and expiry are controlled by server configuration.

### T007 - Seed the initial manager

Status: Complete

Priority: P0
Dependencies: T005, T006

- Read initial-manager values from environment variables.
- Create the account if it does not exist.
- Make seeding idempotent.
- Never overwrite an existing account with the same email.

Acceptance:

- The initial manager is available after startup.
- Repeated startup does not duplicate or overwrite the manager.

### T008 - Implement login and logout endpoints

Status: Complete

Priority: P0
Dependencies: T006, T007

- Implement `POST /api/v1/auth/login`.
- Verify email and password.
- Return a short-lived JWT.
- Implement `POST /api/v1/auth/logout`.
- Apply login attempt rate limiting.

Acceptance:

- Successful login returns 200 and a JWT.
- Invalid credentials return 401.
- Repeated login attempts are rate-limited.
- Logout returns a successful stateless response.

### T009 - Implement authentication and role middleware

Status: Complete

Priority: P0
Dependencies: T006, T008

- Verify bearer JWTs.
- Attach the authenticated staff identity to the request.
- Implement manager role authorisation.
- Prevent role escalation in staff operations.

Acceptance:

- Missing or invalid JWTs return 401.
- Insufficient privileges return 403.
- Manager-only routes reject staff users.

## 4. Staff Management

### T010 - Implement staff repositories and services

Status: Complete

Priority: P1
Dependencies: T005, T009

- Add staff database operations.
- Separate account retrieval, creation, update and deletion logic.
- Enforce password policy and email uniqueness.
- Prevent the deletion of referenced staff accounts.
- Prevent removing the only manager or changing the authenticated user's role.

Acceptance:

- Staff business rules are outside controllers.
- Duplicate email and invalid role requests return appropriate 409 or 400 responses.
- Password hashes never leave the service or repository layer.

### T011 - Implement staff endpoints

Status: Complete

Priority: P1
Dependencies: T010

- Implement:
  - `GET /api/v1/staff`
  - `POST /api/v1/staff`
  - `GET /api/v1/staff/:id`
  - `PUT /api/v1/staff/:id`
  - `PATCH /api/v1/staff/:id`
  - `DELETE /api/v1/staff/:id`

Acceptance:

- Every staff endpoint requires a valid manager JWT.
- Collection results are paginated.
- Create and update responses omit password hashes.

## 5. Menu Categories

### T012 - Implement category model and repository

Status: Complete

Priority: P1
Dependencies: T003

- Create category name and optional description fields.
- Enforce unique category names.
- Add name sorting support.
- Add category reference checks for deletion.

Acceptance:

- Duplicate category names return 409.
- Categories can be queried and sorted by name.

### T013 - Implement category service and endpoints

Status: Complete

Priority: P1
Dependencies: T012, T009

- Implement category CRUD.
- Restrict mutations to managers.
- Permit authenticated reads.
- Prevent deletion while menu items reference the category.

Acceptance:

- CRUD operations use consistent response envelopes.
- Referenced categories return 409 on deletion.

## 6. Menu Items

### T014 - Implement menu item model and repository

Status: Complete

Priority: P1
Dependencies: T003, T012

- Create fields for name, optional description, price, category, photo URL, allergens, dietary requirements and availability.
- Add category reference and validation.
- Add search and filter indexes.
- Represent allergens and dietary requirements as tags/categories with free-text notes.

Acceptance:

- Negative prices are rejected.
- Invalid category references are rejected.
- Availability is represented by a boolean.

### T015 - Implement menu item search and sorting

Status: Complete

Priority: P1
Dependencies: T014

- Add case-insensitive name and description search.
- Add category, dietary, allergen and availability filters.
- Add sorting by name, price and category.
- Add pagination.

Acceptance:

- Invalid filters and sort fields return 400.
- Pagination respects the maximum limit of 50.
- Search and filters return only matching menu items.

### T016 - Implement menu item service and endpoints

Status: Complete

Priority: P1
Dependencies: T014, T015, T009

- Implement menu item CRUD.
- Restrict mutations to managers.
- Permit authenticated reads.
- Restrict deletion while existing orders reference the item.

Acceptance:

- CRUD operations use consistent response envelopes.
- Photo URLs are accepted without upload support.
- Referenced menu items return 409 on deletion.

## 7. Tables

### T017 - Implement table model and repository

Status: Complete

Priority: P1
Dependencies: T003

- Create table number, section, capacity and status fields.
- Enforce unique table numbers.
- Restrict status values to:
  - `Available`
  - `Occupied`
  - `Reserved`
  - `Out of service`
- Add positive integer capacity validation.

Acceptance:

- Duplicate table numbers return 409.
- Invalid statuses and capacities return 400.

### T018 - Implement table service and endpoints

Priority: P1
Dependencies: T017, T009

- Implement table CRUD.
- Restrict mutations to managers.
- Permit authenticated reads.
- Prevent deletion while order history references the table.

Acceptance:

- CRUD operations use consistent response envelopes.
- Referenced tables return 409 on deletion.

## 8. Orders

### T019 - Implement order data models

Priority: P0
Dependencies: T005, T014, T017

- Create order fields for table, created-by staff, creation time, status, special request, notes and completion time.
- Create embedded ordered-item fields.
- Add menu item reference, quantity, unit-price snapshot, subtotal, dietary requirements, special request and note.
- Add order status and table indexes.

Acceptance:

- Orders require at least one ordered item.
- Quantities must be positive integers.
- Unit price and subtotal are server-derived.

### T020 - Implement order price and table validation

Priority: P0
Dependencies: T019

- Derive unit-price snapshots from current menu item prices.
- Calculate line subtotals server-side.
- Reject unavailable menu items.
- Reject missing or invalid menu item references.
- Require an `Available` table.
- Prevent a table from having two active orders.

Acceptance:

- Clients cannot supply unit prices or subtotals.
- Order creation is rejected for unavailable items.
- Order creation is rejected for unavailable, reserved or out-of-service tables.
- Duplicate active table orders return 409.

### T021 - Implement order creation and retrieval

Priority: P0
Dependencies: T020

- Implement `POST /api/v1/orders`.
- Derive created-by staff from the JWT.
- Derive creation time server-side.
- Create orders in `Placed` status.
- Implement paginated order retrieval and filtering.
- Implement order detail retrieval.

Acceptance:

- Creating an order returns 201.
- The creator reference and creation timestamp are server-generated.
- Staff can view order records.
- Managers can view order records.

### T022 - Implement order editing permissions

Priority: P0
Dependencies: T021

- Implement permitted active-order updates.
- Allow only the creating staff member or a manager to edit.
- Reject updates to completed or cancelled orders.
- Disallow status changes through generic detail updates.
- Permit table, items, special request and notes updates.

Acceptance:

- Editing another staff member's order returns 403.
- Editing terminal orders returns 409.
- Generic updates cannot change status.

### T023 - Implement order status transitions

Priority: P0
Dependencies: T021

- Implement valid status transitions.
- Implement `PATCH /api/v1/orders/:id/status`.
- Implement `POST /api/v1/orders/:id/cancel`.
- Set completion timestamp for `Completed`.
- Return 409 for invalid transitions.
- Free the table when an active order reaches a terminal status.

Acceptance:

- Only the PRD transition map is accepted.
- Terminal statuses cannot be changed.
- Cancellation is allowed from `Placed`, `Preparing` or `Ready`.
- Completing or cancelling makes the order immutable.

## 9. Reports

### T024 - Implement order reports

Priority: P1
Dependencies: T021, T023

- Add manager-only `GET /api/v1/reports/orders`.
- Add date range filtering.
- Add staff member filtering.
- Add table filtering.
- Add status filtering.
- Return in-progress count, completed count and matching orders.

Acceptance:

- Staff receive 403.
- Counts reflect only the selected records and filters.
- Unsupported filters return 400.

## 10. Menu Snapshot and Caching

### T025 - Implement versioned menu snapshot

Priority: P1
Dependencies: T013, T016

- Implement authenticated `GET /api/v1/menu-items/snapshot`.
- Include categories and available menu items.
- Generate a version identifier.
- Generate and return an ETag.
- Apply appropriate `Cache-Control` headers.

Acceptance:

- Snapshot output is internally consistent.
- Snapshot payload contains no staff, orders or credentials.
- A matching `If-None-Match` value returns 304.
- Menu/category/availability changes change the version and ETag.

## 11. API Documentation

### T026 - Implement Swagger/OpenAPI documentation

Priority: P1
Dependencies: T008, T011, T013, T016, T018, T021, T024, T025

- Document every endpoint.
- Document methods, paths, parameters and request bodies.
- Document bearer authentication.
- Identify manager-only operations.
- Document success, 400, 401, 403, 404, 409, 500 and 304 responses where relevant.
- Document pagination and response envelopes.
- Document the snapshot ETag behaviour.

Acceptance:

- Swagger documentation loads successfully.
- Every implemented endpoint appears in the documentation.
- Authentication and role requirements are clear.

## 12. Final Verification

### T027 - Verify configuration and startup

Priority: P0
Dependencies: T001-T009

- Verify startup with valid configuration.
- Verify startup rejection with missing configuration.
- Verify local MongoDB connection.
- Verify initial manager seeding.

### T028 - Perform manual authentication and staff verification

Priority: P0
Dependencies: T007-T011

- Verify staff login.
- Verify invalid and missing JWT responses.
- Verify staff and manager role separation.
- Verify staff CRUD operations and password handling.

### T029 - Perform menu and table verification

Priority: P1
Dependencies: T013, T016, T018

- Verify category CRUD.
- Verify menu item CRUD and search/filter/sort behavior.
- Verify table CRUD and status rules.
- Verify referenced-resource deletion restrictions.

### T030 - Perform order verification

Priority: P0
Dependencies: T019-T023

- Verify order creation and server-derived pricing.
- Verify one-active-order-per-table rule.
- Verify staff ownership restrictions.
- Verify manager permissions.
- Verify every status transition and terminal state.
- Verify table release after completion or cancellation.

### T031 - Perform report, caching and API contract verification

Priority: P1
Dependencies: T024-T026

- Verify report filters and counts.
- Verify snapshot versioning and ETag revalidation.
- Verify CORS configuration.
- Verify pagination, validation, errors and Swagger documentation.

## 13. Delivery Checklist

- [ ] Application starts with valid environment configuration.
- [ ] Initial manager is seeded idempotently.
- [ ] Authentication and role middleware are enforced.
- [ ] Staff CRUD works for managers only.
- [ ] Categories and menu items support full CRUD and search.
- [ ] Tables support all defined statuses.
- [ ] Orders enforce active table and ownership rules.
- [ ] Status transitions follow the lifecycle.
- [ ] Reports are manager-only and filterable.
- [ ] Menu snapshot caching is versioned and ETag-aware.
- [ ] Swagger/OpenAPI covers every endpoint.
- [ ] Password hashes and secrets are never returned.
- [ ] All PRD acceptance criteria have been manually verified.
