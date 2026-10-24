import { z } from "zod";

// ============= Common validation patterns =============

// Sanitize text to prevent injection attacks
const sanitizeText = (text: string) => 
  text.replace(/<[^>]*>/g, '').trim();

// ============= Auth Schemas =============

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters")
  .transform(sanitizeText);

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be less than 128 characters");

export const fullNameSchema = z
  .string()
  .trim()
  .max(100, "Name must be less than 100 characters")
  .transform(sanitizeText)
  .optional();

export const authFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});

// ============= Profile Schemas =============

export const usernameSchema = z
  .string()
  .trim()
  .min(1, "Username is required")
  .max(50, "Username must be less than 50 characters")
  .regex(/^[a-zA-Z0-9_\s\-\.]+$/, "Username can only contain letters, numbers, spaces, underscores, hyphens, and periods")
  .transform(sanitizeText);

export const profileDescriptionSchema = z
  .string()
  .max(500, "Description must be less than 500 characters")
  .transform(sanitizeText)
  .optional();

export const profileFormSchema = z.object({
  username: usernameSchema,
  description: profileDescriptionSchema,
});

// ============= Email Schemas =============

export const recipientEmailSchema = z
  .string()
  .trim()
  .min(1, "Recipient email is required")
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters")
  .transform(sanitizeText);

export const senderNameSchema = z
  .string()
  .trim()
  .min(1, "Your name is required")
  .max(100, "Name must be less than 100 characters")
  .transform(sanitizeText);

export const recipientNameSchema = z
  .string()
  .trim()
  .max(100, "Name must be less than 100 characters")
  .transform(sanitizeText)
  .optional();

export const emailBlueprintFormSchema = z.object({
  recipientEmail: recipientEmailSchema,
  recipientName: recipientNameSchema,
  senderName: senderNameSchema,
});

// ============= Goal Schemas =============

export const goalTitleSchema = z
  .string()
  .trim()
  .min(1, "Goal title is required")
  .max(200, "Title must be less than 200 characters")
  .transform(sanitizeText);

export const goalDescriptionSchema = z
  .string()
  .trim()
  .max(1000, "Description must be less than 1000 characters")
  .transform(sanitizeText)
  .optional();

export const goalProgressSchema = z
  .number()
  .min(0, "Progress must be at least 0")
  .max(100, "Progress cannot exceed 100");

export const goalStatusSchema = z.enum([
  "not_started", 
  "in_progress", 
  "completed", 
  "on_hold"
]);

export const goalCategorySchema = z
  .string()
  .max(50, "Category must be less than 50 characters")
  .transform(sanitizeText)
  .optional();

export const goalFormSchema = z.object({
  title: goalTitleSchema,
  description: goalDescriptionSchema,
  targetDate: z.string().optional(),
  category: goalCategorySchema,
  progress: goalProgressSchema,
  status: goalStatusSchema,
});

// ============= Note Schemas =============

export const noteContentSchema = z
  .string()
  .trim()
  .min(1, "Note content is required")
  .max(5000, "Note must be less than 5000 characters")
  .transform(sanitizeText);

export const noteTagSchema = z
  .string()
  .trim()
  .max(50, "Tag must be less than 50 characters")
  .transform(sanitizeText);

export const noteFormSchema = z.object({
  content: noteContentSchema,
  tags: z.array(noteTagSchema).max(10, "Maximum 10 tags allowed"),
});

// ============= Reflection Schemas =============

export const reflectionAnswerSchema = z
  .string()
  .max(10000, "Answer must be less than 10,000 characters")
  .transform(sanitizeText);

// ============= Utility function for form validation =============

export type ValidationError = {
  field: string;
  message: string;
};

export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(value);
    return { success: true, data: result };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, error: e.errors[0].message };
    }
    return { success: false, error: "Validation failed" };
  }
}

export function validateForm<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): { success: true; data: z.infer<typeof schema> } | { success: false; errors: Record<string, string> } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (e) {
    if (e instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      e.errors.forEach((err) => {
        const field = err.path.join(".");
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: "Validation failed" } };
  }
}
