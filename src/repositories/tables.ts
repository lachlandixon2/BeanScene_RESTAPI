import mongoose from 'mongoose';
import { Types, type HydratedDocument } from 'mongoose';
import { Table, type TableDocument, type TableStatus } from '../models/Table.js';

export interface TableRecord {
  id: string;
  tableNumber: number;
  section: string;
  capacity: number;
  status: TableStatus;
}

export interface TableRepositoryUpdate {
  tableNumber?: number;
  section?: string;
  capacity?: number;
  status?: TableStatus;
}

function toTableRecord(table: HydratedDocument<TableDocument>): TableRecord {
  return {
    id: table.id,
    tableNumber: table.tableNumber,
    section: table.section,
    capacity: table.capacity,
    status: table.status,
  };
}

export async function listTables(
  page: number,
  limit: number,
): Promise<{ tables: TableRecord[]; total: number }> {
  const [tables, total] = await Promise.all([
    Table.find()
      .sort({ tableNumber: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Table.countDocuments(),
  ]);

  return { tables: tables.map(toTableRecord), total };
}

export async function findTableById(tableId: string): Promise<TableRecord | null> {
  const table = await Table.findById(tableId);
  return table ? toTableRecord(table) : null;
}

export async function tableNumberExists(
  tableNumber: number,
  exceptTableId?: string,
): Promise<boolean> {
  const query = exceptTableId
    ? { tableNumber, _id: { $ne: new Types.ObjectId(exceptTableId) } }
    : { tableNumber };
  return (await Table.exists(query)) !== null;
}

export async function isTableReferencedByOrders(tableId: string): Promise<boolean> {
  const order = await mongoose.connection
    .collection('orders')
    .findOne({ table: new Types.ObjectId(tableId) }, { projection: { _id: 1 } });
  return order !== null;
}

export async function createTable(data: {
  tableNumber: number;
  section: string;
  capacity: number;
  status: TableStatus;
}): Promise<TableRecord> {
  const table = await Table.create(data);
  return toTableRecord(table);
}

export async function updateTable(
  tableId: string,
  updates: TableRepositoryUpdate,
): Promise<TableRecord | null> {
  const table = await Table.findByIdAndUpdate(
    tableId,
    { $set: updates },
    { new: true, runValidators: true },
  );
  return table ? toTableRecord(table) : null;
}

export async function deleteTable(tableId: string): Promise<boolean> {
  const result = await Table.deleteOne({ _id: tableId });
  return result.deletedCount > 0;
}
