import type { StaffRole } from '../models/Staff.js';

declare global {
  namespace Express {
    interface Request {
      authenticatedStaff?: {
        staffId: string;
        role: StaffRole;
      };
    }
  }
}

export {};
