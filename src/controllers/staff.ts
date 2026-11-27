import type { Request, Response } from 'express';
import {
  createStaff,
  deleteStaff,
  getStaff,
  listStaff,
  updateStaff,
  type UpdateStaffInput,
} from '../services/staff.js';
import type { StaffRole } from '../models/Staff.js';
import { HttpError } from '../utils/httpErrors.js';
import { objectIdSchema, paginationSchema, parseWithSchema } from '../validators/common.js';
import {
  createStaffSchema,
  patchStaffSchema,
  replaceStaffSchema,
} from '../validators/staff.js';

function getAuthenticatedStaffId(request: Request): string {
  if (!request.authenticatedStaff) {
    throw new HttpError(401, 'Authentication required');
  }
  return request.authenticatedStaff.staffId;
}

function getStaffId(request: Request): string {
  return parseWithSchema(objectIdSchema, request.params.id);
}

function toUpdateStaffInput(input: {
  name?: string | undefined;
  email?: string | undefined;
  password?: string | undefined;
  role?: StaffRole | undefined;
}): UpdateStaffInput {
  const updates: UpdateStaffInput = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.email !== undefined) updates.email = input.email;
  if (input.password !== undefined) updates.password = input.password;
  if (input.role !== undefined) updates.role = input.role;
  return updates;
}

export async function listStaffController(request: Request, response: Response): Promise<void> {
  const { page, limit } = parseWithSchema(paginationSchema, request.query);
  const result = await listStaff(page, limit);

  response.status(200).json({
    success: true,
    message: 'Staff accounts retrieved successfully',
    data: {
      accounts: result.accounts,
      pagination: result.pagination,
    },
  });
}

export async function createStaffController(request: Request, response: Response): Promise<void> {
  const { role, ...input } = parseWithSchema(createStaffSchema, request.body);
  const staffInput = role === undefined ? input : { ...input, role };
  const account = await createStaff(staffInput);

  response.status(201).json({
    success: true,
    message: 'Staff account created successfully',
    data: account,
  });
}

export async function getStaffController(request: Request, response: Response): Promise<void> {
  const account = await getStaff(getStaffId(request));

  response.status(200).json({
    success: true,
    message: 'Staff account retrieved successfully',
    data: account,
  });
}

export async function replaceStaffController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = toUpdateStaffInput(parseWithSchema(replaceStaffSchema, request.body));
  const account = await updateStaff(
    getStaffId(request),
    input,
    getAuthenticatedStaffId(request),
  );

  response.status(200).json({
    success: true,
    message: 'Staff account updated successfully',
    data: account,
  });
}

export async function patchStaffController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = toUpdateStaffInput(parseWithSchema(patchStaffSchema, request.body));
  const account = await updateStaff(
    getStaffId(request),
    input,
    getAuthenticatedStaffId(request),
  );

  response.status(200).json({
    success: true,
    message: 'Staff account updated successfully',
    data: account,
  });
}

export async function deleteStaffController(request: Request, response: Response): Promise<void> {
  await deleteStaff(getStaffId(request));

  response.status(200).json({
    success: true,
    message: 'Staff account deleted successfully',
    data: {},
  });
}
