import type { TableStatus } from '../models/Table.js';
import {
  createTable as createTableRecord,
  deleteTable as deleteTableRecord,
  findTableById,
  isTableReferencedByOrders,
  listTables as listTableRecords,
  tableNumberExists,
  updateTable as updateTableRecord,
  type TableRecord,
  type TableRepositoryUpdate,
} from '../repositories/tables.js';
import type { Pagination } from '../types/http.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/httpErrors.js';
import { objectIdSchema, parseWithSchema } from '../validators/common.js';

export interface CreateTableInput {
  tableNumber: number;
  section: string;
  capacity: number;
  status: TableStatus;
}

export interface UpdateTableInput {
  tableNumber?: number;
  section?: string;
  capacity?: number;
  status?: TableStatus;
}

export interface PaginatedTables {
  tables: TableRecord[];
  pagination: Pagination;
}

function validatePagination(page: number, limit: number): void {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ValidationError('Invalid pagination values', [
      { message: 'Page must be a positive integer and limit must be between 1 and 50' },
    ]);
  }
}

function validateSection(section: string): string {
  const trimmedSection = section.trim();
  if (!trimmedSection) {
    throw new ValidationError('Table section must not be empty', [
      { field: 'section', message: 'Section is required' },
    ]);
  }
  return trimmedSection;
}

function validateTableNumber(tableNumber: number): void {
  if (!Number.isInteger(tableNumber) || tableNumber < 1) {
    throw new ValidationError('Invalid table number', [
      { field: 'tableNumber', message: 'Table number must be a positive integer' },
    ]);
  }
}

function validateCapacity(capacity: number): void {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new ValidationError('Invalid table capacity', [
      { field: 'capacity', message: 'Capacity must be a positive integer' },
    ]);
  }
}

export async function listTables(page: number, limit: number): Promise<PaginatedTables> {
  validatePagination(page, limit);
  const { tables, total } = await listTableRecords(page, limit);
  return {
    tables,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTable(tableId: string): Promise<TableRecord> {
  parseWithSchema(objectIdSchema, tableId);
  const table = await findTableById(tableId);
  if (!table) {
    throw new NotFoundError('Table not found');
  }
  return table;
}

export async function createTable(input: CreateTableInput): Promise<TableRecord> {
  validateTableNumber(input.tableNumber);
  validateCapacity(input.capacity);
  const section = validateSection(input.section);

  if (await tableNumberExists(input.tableNumber)) {
    throw new ConflictError('A table with this number already exists');
  }

  return createTableRecord({ ...input, section });
}

export async function updateTable(
  tableId: string,
  input: UpdateTableInput,
): Promise<TableRecord> {
  parseWithSchema(objectIdSchema, tableId);
  if (!(await findTableById(tableId))) {
    throw new NotFoundError('Table not found');
  }

  const updates: TableRepositoryUpdate = {};
  if (input.tableNumber !== undefined) {
    validateTableNumber(input.tableNumber);
    updates.tableNumber = input.tableNumber;
  }
  if (input.section !== undefined) updates.section = validateSection(input.section);
  if (input.capacity !== undefined) {
    validateCapacity(input.capacity);
    updates.capacity = input.capacity;
  }
  if (input.status !== undefined) updates.status = input.status;

  if (Object.keys(updates).length === 0) {
    throw new ValidationError('No table fields provided for update');
  }

  if (
    updates.tableNumber !== undefined &&
    (await tableNumberExists(updates.tableNumber, tableId))
  ) {
    throw new ConflictError('A table with this number already exists');
  }

  const updatedTable = await updateTableRecord(tableId, updates);
  if (!updatedTable) {
    throw new NotFoundError('Table not found');
  }
  return updatedTable;
}

export async function deleteTable(tableId: string): Promise<void> {
  parseWithSchema(objectIdSchema, tableId);
  if (!(await findTableById(tableId))) {
    throw new NotFoundError('Table not found');
  }
  if (await isTableReferencedByOrders(tableId)) {
    throw new ConflictError('Tables referenced by orders cannot be deleted');
  }
  if (!(await deleteTableRecord(tableId))) {
    throw new NotFoundError('Table not found');
  }
}
