import { model, Schema } from 'mongoose';

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Out of service';

interface TableFields {
  tableNumber: number;
  section: string;
  capacity: number;
  status: TableStatus;
}

const tableSchema = new Schema<TableFields>(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Capacity must be a positive integer',
      },
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved', 'Out of service'],
      required: true,
    },
  },
  { timestamps: true },
);

export type TableDocument = TableFields;
export const Table = model<TableFields>('Table', tableSchema);
