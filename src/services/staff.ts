import type { StaffRole } from '../models/Staff.js';
import {
  countManagers,
  createStaff as createStaffRecord,
  deleteStaff as deleteStaffRecord,
  emailExists,
  findStaffById,
  isStaffReferencedByOrders,
  listStaff as listStaffRecords,
  updateStaff as updateStaffRecord,
  type StaffAccount,
  type StaffRepositoryUpdate,
} from '../repositories/staff.js';
import { hashPassword } from '../utils/password.js';
import { ConflictError, HttpError, NotFoundError, ValidationError } from '../utils/httpErrors.js';
import { objectIdSchema, parseWithSchema } from '../validators/common.js';
import type { Pagination } from '../types/http.js';

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role?: StaffRole;
}

export interface UpdateStaffInput {
  name?: string;
  email?: string;
  password?: string;
  role?: StaffRole;
}

export interface PaginatedStaff {
  accounts: StaffAccount[];
  pagination: Pagination;
}

function validateName(name: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new ValidationError('Name must not be empty', [{ field: 'name', message: 'Name is required' }]);
  }
  return trimmedName;
}

function normaliseEmail(email: string): string {
  const normalisedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalisedEmail)) {
    throw new ValidationError('Invalid email address', [
      { field: 'email', message: 'Enter a valid email address' },
    ]);
  }
  return normalisedEmail;
}

function validateRole(role: unknown): StaffRole {
  if (role !== 'staff' && role !== 'manager') {
    throw new ValidationError('Invalid staff role', [
      { field: 'role', message: 'Role must be staff or manager' },
    ]);
  }
  return role;
}

function validatePagination(page: number, limit: number): void {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ValidationError('Invalid pagination values', [
      { message: 'Page must be a positive integer and limit must be between 1 and 50' },
    ]);
  }
}

export async function listStaff(page: number, limit: number): Promise<PaginatedStaff> {
  validatePagination(page, limit);
  const { accounts, total } = await listStaffRecords(page, limit);
  return {
    accounts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getStaff(staffId: string): Promise<StaffAccount> {
  parseWithSchema(objectIdSchema, staffId);
  const staff = await findStaffById(staffId);
  if (!staff) {
    throw new NotFoundError('Staff account not found');
  }
  return staff;
}

export async function createStaff(input: CreateStaffInput): Promise<StaffAccount> {
  const name = validateName(input.name);
  const email = normaliseEmail(input.email);
  const role = input.role === undefined ? 'staff' : validateRole(input.role);

  if (await emailExists(email)) {
    throw new ConflictError('A staff account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  return createStaffRecord({ name, email, passwordHash, role });
}

export async function updateStaff(
  staffId: string,
  input: UpdateStaffInput,
  authenticatedStaffId: string,
): Promise<StaffAccount> {
  parseWithSchema(objectIdSchema, staffId);
  parseWithSchema(objectIdSchema, authenticatedStaffId);

  const existingStaff = await findStaffById(staffId);
  if (!existingStaff) {
    throw new NotFoundError('Staff account not found');
  }

  const updates: StaffRepositoryUpdate = {};
  if (input.name !== undefined) {
    updates.name = validateName(input.name);
  }
  if (input.email !== undefined) {
    updates.email = normaliseEmail(input.email);
  }
  if (input.password !== undefined) {
    updates.passwordHash = await hashPassword(input.password);
  }
  if (input.role !== undefined) {
    updates.role = validateRole(input.role);
    if (
      existingStaff.id === authenticatedStaffId.toLowerCase() &&
      updates.role !== existingStaff.role
    ) {
      throw new HttpError(403, 'You cannot change your own role');
    }
  }
  if (Object.keys(updates).length === 0) {
    throw new ValidationError('No staff fields provided for update');
  }

  if (updates.email && (await emailExists(updates.email, staffId))) {
    throw new ConflictError('A staff account with this email already exists');
  }

  const updatedStaff = await updateStaffRecord(staffId, updates);
  if (!updatedStaff) {
    throw new NotFoundError('Staff account not found');
  }
  return updatedStaff;
}

export async function deleteStaff(staffId: string): Promise<void> {
  parseWithSchema(objectIdSchema, staffId);
  const staff = await findStaffById(staffId);
  if (!staff) {
    throw new NotFoundError('Staff account not found');
  }

  if (staff.role === 'manager' && (await countManagers()) <= 1) {
    throw new ConflictError('The only manager account cannot be deleted');
  }
  if (await isStaffReferencedByOrders(staffId)) {
    throw new ConflictError('Staff accounts referenced by orders cannot be deleted');
  }
  if (!(await deleteStaffRecord(staffId))) {
    throw new NotFoundError('Staff account not found');
  }
}
