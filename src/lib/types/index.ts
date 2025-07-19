import { z } from "zod";

// ==========================================
// Enum Definitions
// ==========================================
export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const ActivityTypeEnum = z.enum([
  "TASK_CREATED",
  "TASK_UPDATED", 
  "TASK_COMPLETED",
  "TASK_DELETED",
  "SUBTASK_ADDED",
  "SUBTASK_COMPLETED",
  "GROUP_CREATED",
  "GROUP_UPDATED",
  "STREAK_UPDATED",
  "POINTS_EARNED"
]);

export const ThemeEnum = z.enum(["default", "alireza", "neda"]);

// ==========================================
// Zod Schemas for Validation
// ==========================================

// User related schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email({ message: "ایمیل معتبر نیست" }),
  username: z.string().min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد").max(50, "نام کاربری نمی‌تواند بیش از ۵۰ کاراکتر باشد").nullable(),
  avatar: z.string().url({ message: "آدرس تصویر معتبر نیست" }).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  theme: ThemeEnum,
  darkMode: z.boolean(),
  aiPreference: z.number().min(0).max(1),
  geminiApiKey: z.string().nullable(),
  onboardingDone: z.boolean(),
  auraPoints: z.number().int().min(0),
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  lastActiveDate: z.date().nullable(),
  isGuest: z.boolean().default(false),
  guestUpgradedAt: z.date().nullable(),
  guestUpgradedToId: z.string().nullable(),
});

export const UserStatsSchema = z.object({
  tasksToday: z.number().int().min(0),
  tasksCompleted: z.number().int().min(0),
  tasksTotal: z.number().int().min(0),
  completionRate: z.number().min(0).max(100),
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  auraPoints: z.number().int().min(0),
  taskGroups: z.number().int().min(0),
});

export const UpdateUserPreferencesSchema = z.object({
  theme: ThemeEnum.default("default"),
  darkMode: z.boolean().default(false),
  aiPreference: z.number().min(0).max(1).default(0.5),
  geminiApiKey: z.string().optional(),
});

export const UpdateUserProfileSchema = z.object({
  username: z.string().min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد").max(50, "نام کاربری نمی‌تواند بیش از ۵۰ کاراکتر باشد"),
  avatar: z.string().url({ message: "آدرس تصویر معتبر نیست" }).optional(),
});

// Task related schemas
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است").max(200, "عنوان نمی‌تواند بیش از ۲۰۰ کاراکتر باشد"),
  description: z.string().optional(),
  priority: PriorityEnum.default("MEDIUM"),
  dueDate: z.date().optional(),
  taskGroupId: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string(),
  status: TaskStatusEnum.optional(),
  importanceScore: z.number().min(0).max(100).optional(),
  urgencyScore: z.number().min(0).max(100).optional(),
});

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatusEnum,
  priority: PriorityEnum,
  importanceScore: z.number().min(0).max(100).nullable(),
  urgencyScore: z.number().min(0).max(100).nullable(),
  dueDate: z.date().nullable(),
  completedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  auraPoints: z.number().int().min(0),
  userId: z.string(),
  taskGroupId: z.string().nullable(),
});

// Task Group related schemas
export const CreateTaskGroupSchema = z.object({
  name: z.string().min(1, "نام گروه الزامی است").max(100, "نام گروه نمی‌تواند بیش از ۱۰۰ کاراکتر باشد"),
  description: z.string().optional(),
  emoji: z.string().default("📝"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "رنگ معتبر نیست").default("#3b82f6"),
});

export const UpdateTaskGroupSchema = CreateTaskGroupSchema.partial().extend({
  id: z.string(),
  position: z.number().int().min(0).optional(),
});

export const TaskGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  color: z.string(),
  description: z.string().nullable(),
  position: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

// SubTask related schemas
export const CreateSubTaskSchema = z.object({
  title: z.string().min(1, "عنوان زیر-وظیفه الزامی است").max(200),
  taskId: z.string(),
});

export const UpdateSubTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "عنوان زیر-وظیفه الزامی است").max(200).optional(),
  completed: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

export const SubTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  position: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  taskId: z.string(),
});

// Activity Log related schemas
export const ActivityLogSchema = z.object({
  id: z.string(),
  action: ActivityTypeEnum,
  details: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.date(),
  userId: z.string(),
  taskId: z.string().nullable(),
});

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

// ==========================================
// Type Exports
// ==========================================

// Enum Types
export type TaskStatus = z.infer<typeof TaskStatusEnum>;
export type Priority = z.infer<typeof PriorityEnum>;
export type ActivityType = z.infer<typeof ActivityTypeEnum>;
export type Theme = z.infer<typeof ThemeEnum>;

// User Types
export type User = z.infer<typeof UserSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

// Task Types
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// Task Group Types
export type TaskGroup = z.infer<typeof TaskGroupSchema>;
export type CreateTaskGroupInput = z.infer<typeof CreateTaskGroupSchema>;
export type UpdateTaskGroupInput = z.infer<typeof UpdateTaskGroupSchema>;

// SubTask Types
export type SubTask = z.infer<typeof SubTaskSchema>;
export type CreateSubTaskInput = z.infer<typeof CreateSubTaskSchema>;
export type UpdateSubTaskInput = z.infer<typeof UpdateSubTaskSchema>;

// Activity Log Types
export type ActivityLog = z.infer<typeof ActivityLogSchema>;

// API Response Types
export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// ==========================================
// UI State Types
// ==========================================
export interface UIState {
  sidebarOpen: boolean;
  currentTheme: Theme;
  darkMode: boolean;
  activeModal: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

// ==========================================
// Dashboard Types
// ==========================================
export interface DashboardStats {
  tasksToday: number;
  currentStreak: number;
  auraPoints: number;
  completionRate: number;
}

export interface SmartInfoPod {
  type: "priority" | "quick_win" | "upcoming";
  title: string;
  description: string;
  taskId?: string;
  dueDate?: Date;
}

// ==========================================
// Error Handling Types
// ==========================================
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

// ==========================================
// Utility Types
// ==========================================
export type WithPagination<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
};