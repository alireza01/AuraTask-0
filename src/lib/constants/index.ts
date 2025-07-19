// App information
export const APP_NAME = "اورا تسک";
export const APP_DESCRIPTION = "مدیریت وظایف شخصی با قابلیت‌های هوش مصنوعی";
export const APP_VERSION = "0.1.0";

// Navigation
export const NAV_ITEMS = [
  { name: "داشبورد", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "زمان‌بندی", href: "/timeline", icon: "Calendar" },
  { name: "رتبه‌بندی", href: "/leaderboard", icon: "Trophy" },
  { name: "تنظیمات", href: "/settings", icon: "Settings" },
];

// Task status options
export const TASK_STATUS_OPTIONS = [
  { value: "TODO", label: "در انتظار", color: "bg-gray-200 text-gray-800" },
  { value: "IN_PROGRESS", label: "در حال انجام", color: "bg-blue-200 text-blue-800" },
  { value: "COMPLETED", label: "تکمیل شده", color: "bg-green-200 text-green-800" },
  { value: "CANCELLED", label: "لغو شده", color: "bg-red-200 text-red-800" },
];

// Priority options
export const PRIORITY_OPTIONS = [
  { value: "LOW", label: "کم", color: "bg-gray-200 text-gray-800" },
  { value: "MEDIUM", label: "متوسط", color: "bg-blue-200 text-blue-800" },
  { value: "HIGH", label: "زیاد", color: "bg-orange-200 text-orange-800" },
  { value: "URGENT", label: "فوری", color: "bg-red-200 text-red-800" },
];

// Theme options
export const THEME_OPTIONS = [
  { value: "default", label: "پیش‌فرض", description: "تم استاندارد با کنتراست بالا" },
  { value: "alireza", label: "علیرضا", description: "تم ماتریکس با افکت‌های خاص" },
  { value: "neda", label: "ندا", description: "تم پاستلی با رنگ‌های بنفش و صورتی" },
];

// API endpoints
export const API_ENDPOINTS = {
  TASKS: "/api/tasks",
  TASK_GROUPS: "/api/task-groups",
  USER: "/api/user",
  STATS: "/api/stats",
  AI: "/api/ai",
};