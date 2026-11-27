import { z } from 'zod';

const tableFields = {
  tableNumber: z.number().int().positive(),
  section: z.string().trim().min(1),
  capacity: z.number().int().positive(),
  status: z.enum(['Available', 'Occupied', 'Reserved', 'Out of service']),
};

export const createTableSchema = z
  .object({
    tableNumber: tableFields.tableNumber,
    section: tableFields.section,
    capacity: tableFields.capacity,
    status: tableFields.status,
  })
  .strict();

export const replaceTableSchema = createTableSchema;

export const patchTableSchema = z
  .object({
    tableNumber: tableFields.tableNumber.optional(),
    section: tableFields.section.optional(),
    capacity: tableFields.capacity.optional(),
    status: tableFields.status.optional(),
  })
  .strict()
  .refine((table) => Object.keys(table).length > 0, {
    message: 'At least one table field must be provided',
  });
