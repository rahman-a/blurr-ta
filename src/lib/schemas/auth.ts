import { z } from "zod";

// Validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterData = z.infer<typeof registerSchema>;

export interface RegisterResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
    updatedAt: string;
  };
}
