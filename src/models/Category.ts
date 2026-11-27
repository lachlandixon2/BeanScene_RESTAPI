import { model, Schema } from 'mongoose';

interface CategoryFields {
  name: string;
  description?: string;
}

const categorySchema = new Schema<CategoryFields>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export type CategoryDocument = CategoryFields;
export const Category = model<CategoryFields>('Category', categorySchema);
