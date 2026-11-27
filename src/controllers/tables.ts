import type { Request, Response } from 'express';
import {
  createTable,
  deleteTable,
  getTable,
  listTables,
  updateTable,
  type CreateTableInput,
  type UpdateTableInput,
} from '../services/tables.js';
import { objectIdSchema, paginationSchema, parseWithSchema } from '../validators/common.js';
import {
  createTableSchema,
  patchTableSchema,
  replaceTableSchema,
} from '../validators/tables.js';

function getTableId(request: Request): string {
  return parseWithSchema(objectIdSchema, request.params.id);
}

function toCreateTableInput(input: CreateTableInput): CreateTableInput {
  return {
    tableNumber: input.tableNumber,
    section: input.section,
    capacity: input.capacity,
    status: input.status,
  };
}

function toUpdateTableInput(input: {
  tableNumber?: number | undefined;
  section?: string | undefined;
  capacity?: number | undefined;
  status?: UpdateTableInput['status'] | undefined;
}): UpdateTableInput {
  const updates: UpdateTableInput = {};
  if (input.tableNumber !== undefined) updates.tableNumber = input.tableNumber;
  if (input.section !== undefined) updates.section = input.section;
  if (input.capacity !== undefined) updates.capacity = input.capacity;
  if (input.status !== undefined) updates.status = input.status;
  return updates;
}

export async function listTablesController(
  request: Request,
  response: Response,
): Promise<void> {
  const { page, limit } = parseWithSchema(paginationSchema, request.query);
  const result = await listTables(page, limit);

  response.status(200).json({
    success: true,
    message: 'Tables retrieved successfully',
    data: {
      tables: result.tables,
      pagination: result.pagination,
    },
  });
}

export async function createTableController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = parseWithSchema(createTableSchema, request.body);
  const table = await createTable(toCreateTableInput(input));

  response.status(201).json({
    success: true,
    message: 'Table created successfully',
    data: table,
  });
}

export async function getTableController(
  request: Request,
  response: Response,
): Promise<void> {
  const table = await getTable(getTableId(request));

  response.status(200).json({
    success: true,
    message: 'Table retrieved successfully',
    data: table,
  });
}

export async function replaceTableController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = toUpdateTableInput(parseWithSchema(replaceTableSchema, request.body));
  const table = await updateTable(getTableId(request), input);

  response.status(200).json({
    success: true,
    message: 'Table updated successfully',
    data: table,
  });
}

export async function patchTableController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = toUpdateTableInput(parseWithSchema(patchTableSchema, request.body));
  const table = await updateTable(getTableId(request), input);

  response.status(200).json({
    success: true,
    message: 'Table updated successfully',
    data: table,
  });
}

export async function deleteTableController(
  request: Request,
  response: Response,
): Promise<void> {
  await deleteTable(getTableId(request));

  response.status(200).json({
    success: true,
    message: 'Table deleted successfully',
    data: {},
  });
}
