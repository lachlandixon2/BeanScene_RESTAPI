import { model, Schema } from 'mongoose';

export type StaffRole = 'staff' | 'manager';

interface StaffFields {
  name: string;
  email: string;
  passwordHash: string;
  role: StaffRole;
}

const staffSchema = new Schema<StaffFields>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['staff', 'manager'],
      required: true,
      default: 'staff',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, returnedObject) => {
        const publicObject = returnedObject as Record<string, unknown>;
        delete publicObject.passwordHash;
        return publicObject;
      },
    },
  },
);

staffSchema.index({ role: 1 });

export type StaffDocument = StaffFields;
export const Staff = model<StaffFields>('Staff', staffSchema);
