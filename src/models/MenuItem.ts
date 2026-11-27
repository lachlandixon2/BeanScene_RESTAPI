import { model, Schema, Types } from 'mongoose';
import { Category } from './Category.js';

export interface MenuItemTags {
  tags: string[];
  notes?: string;
}

interface MenuItemFields {
  name: string;
  description?: string;
  price: number;
  category: Types.ObjectId;
  photoUrl?: string;
  allergens: MenuItemTags;
  dietaryRequirements: MenuItemTags;
  availability: boolean;
}

const menuItemTagsSchema = new Schema<MenuItemTags>(
  {
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.every((tag) => tag.trim().length > 0),
        message: 'Tags must not be empty',
      },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const menuItemSchema = new Schema<MenuItemFields>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      validate: {
        validator: async (categoryId: Types.ObjectId) =>
          (await Category.exists({ _id: categoryId })) !== null,
        message: 'Category does not exist',
      },
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    allergens: {
      type: menuItemTagsSchema,
      required: true,
      default: () => ({}),
    },
    dietaryRequirements: {
      type: menuItemTagsSchema,
      required: true,
      default: () => ({}),
    },
    availability: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ 'dietaryRequirements.tags': 1 });
menuItemSchema.index({ 'allergens.tags': 1 });
menuItemSchema.index({ availability: 1 });
menuItemSchema.index({ price: 1 });

export type MenuItemDocument = MenuItemFields;
export const MenuItem = model<MenuItemFields>('MenuItem', menuItemSchema);
