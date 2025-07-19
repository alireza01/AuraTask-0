// Export all utility functions
export * from "./db-utils";
export * from "./error-utils";
export * from "./response-utils";
export * from "./model-utils";

/**
 * Format date to Persian format
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatPersianDate(date: Date): string {
    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}

/**
 * Format time to Persian format
 * @param date - Date to format
 * @returns Formatted time string
 */
export function formatPersianTime(date: Date): string {
    return new Intl.DateTimeFormat("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

/**
 * Format date and time to Persian format
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export function formatPersianDateTime(date: Date): string {
    return `${formatPersianDate(date)} ${formatPersianTime(date)}`;
}

/**
 * Calculate days remaining until a due date
 * @param dueDate - Due date
 * @returns Number of days remaining (negative if overdue)
 */
export function getDaysRemaining(dueDate: Date): number {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate a random color in hex format
 * @returns Random hex color
 */
export function generateRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
}

/**
 * Generate a random emoji from a predefined list
 * @returns Random emoji
 */
export function generateRandomEmoji(): string {
    const emojis = ["📝", "✅", "🎯", "🚀", "⭐", "📊", "📈", "🔍", "💡", "🏆", "🎨", "📱", "💻", "🔧", "📚"];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Truncate text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns Whether the date is today
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns Whether the date is in the past
 */
export function isPast(date: Date): boolean {
    return date.getTime() < new Date().getTime();
}

/**
 * Calculate completion percentage
 * @param completed - Number of completed items
 * @param total - Total number of items
 * @returns Completion percentage
 */
export function calculateCompletionPercentage(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}