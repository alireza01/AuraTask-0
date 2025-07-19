import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "همین الان";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} روز پیش`;
  
  return formatDate(d);
}

export function calculateAuraPoints(
  importance: number,
  urgency: number,
  completed: boolean = false
): number {
  if (!completed) return 0;
  
  const basePoints = Math.round((importance + urgency) / 2);
  const bonusMultiplier = importance > 80 && urgency > 80 ? 1.5 : 1;
  
  return Math.round(basePoints * bonusMultiplier);
}

export function getTaskPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "text-red-500 bg-red-50 dark:bg-red-950";
    case "high":
      return "text-orange-500 bg-orange-50 dark:bg-orange-950";
    case "medium":
      return "text-blue-500 bg-blue-50 dark:bg-blue-950";
    case "low":
      return "text-gray-500 bg-gray-50 dark:bg-gray-950";
    default:
      return "text-gray-500 bg-gray-50 dark:bg-gray-950";
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "text-green-500 bg-green-50 dark:bg-green-950";
    case "in_progress":
      return "text-blue-500 bg-blue-50 dark:bg-blue-950";
    case "todo":
      return "text-gray-500 bg-gray-50 dark:bg-gray-950";
    case "cancelled":
      return "text-red-500 bg-red-50 dark:bg-red-950";
    default:
      return "text-gray-500 bg-gray-50 dark:bg-gray-950";
  }
}