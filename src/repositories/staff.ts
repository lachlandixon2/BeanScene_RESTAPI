import mongoose, { Types, type HydratedDocument } from 'mongoose';
import { Staff, type StaffDocument, type StaffRole } from '../models/Staff.js';

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
}

export interface StaffRepositoryUpdate {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: StaffRole;
}

function toStaffAccount(staff: HydratedDocument<StaffDocument>): StaffAccount {
  return {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
  };
}

export async function listStaff(
  page: number,
  limit: number,
): Promise<{ accounts: StaffAccount[]; total: number }> {
  const [staff, total] = await Promise.all([
    Staff.find()
      .select('name email role')
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Staff.countDocuments(),
  ]);

  return { accounts: staff.map(toStaffAccount), total };
}

export async function findStaffById(staffId: string): Promise<StaffAccount | null> {
  const staff = await Staff.findById(staffId).select('name email role');
  return staff ? toStaffAccount(staff) : null;
}

export async function emailExists(email: string, exceptStaffId?: string): Promise<boolean> {
  const query = exceptStaffId
    ? { email, _id: { $ne: new Types.ObjectId(exceptStaffId) } }
    : { email };
  return (await Staff.exists(query)) !== null;
}

export async function createStaff(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: StaffRole;
}): Promise<StaffAccount> {
  const staff = await Staff.create(data);
  return toStaffAccount(staff);
}

export async function updateStaff(
  staffId: string,
  updates: StaffRepositoryUpdate,
): Promise<StaffAccount | null> {
  const staff = await Staff.findByIdAndUpdate(
    staffId,
    { $set: updates },
    { new: true, runValidators: true },
  ).select('name email role');

  return staff ? toStaffAccount(staff) : null;
}

export async function countManagers(): Promise<number> {
  return Staff.countDocuments({ role: 'manager' });
}

export async function isStaffReferencedByOrders(staffId: string): Promise<boolean> {
  const order = await mongoose.connection
    .collection('orders')
    .findOne({ createdBy: new Types.ObjectId(staffId) }, { projection: { _id: 1 } });
  return order !== null;
}

export async function deleteStaff(staffId: string): Promise<boolean> {
  const result = await Staff.deleteOne({ _id: staffId });
  return result.deletedCount > 0;
}
