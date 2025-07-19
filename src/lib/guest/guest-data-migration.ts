import { db } from "@/lib/db";
import { GuestUserManager } from "./guest-user-manager";
import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Handles the migration of data from a guest user to an authenticated user
 */
export class GuestDataMigration {
  /**
   * Migrate data from a guest user to an authenticated user
   * @param guestUserId The ID of the guest user
   * @param authUserId The ID of the authenticated user
   * @returns True if migration was successful, false otherwise
   */
  static async migrateGuestData(guestUserId: string, authUserId: string): Promise<boolean> {
    try {
      // Start a transaction to ensure data consistency
      return await db.$transaction(async (tx) => {
        // 1. Migrate task groups
        await this.migrateTaskGroups(tx, guestUserId, authUserId);

        // 2. Migrate tasks
        await this.migrateTasks(tx, guestUserId, authUserId);

        // 3. Migrate user stats (aura points, streak, etc.)
        await this.migrateUserStats(tx, guestUserId, authUserId);

        // 4. Mark the guest user as inactive
        await tx.user.update({
          where: { id: guestUserId },
          data: {
            // Mark the guest account as no longer a guest
            // Using type assertion to handle the isGuest property
            ...(({ isGuest: false } as unknown)),
            // Store upgrade info in the username for now
            // We'll use proper fields after Prisma client is regenerated
            // Add a note to the username to indicate this was a guest account
            username: await tx.user.findUnique({ where: { id: guestUserId }, select: { username: true } })
              .then(user => `${user?.username || 'Guest'} (Upgraded)`)
          }
        });

        return true;
      });
    } catch (error) {
      console.error("Error migrating guest data:", error);
      return false;
    }
  }

  /**
   * Migrate task groups from guest user to authenticated user
   */
  private static async migrateTaskGroups(tx: Prisma.TransactionClient, guestUserId: string, authUserId: string): Promise<void> {
    // Get all task groups from the guest user
    const guestTaskGroups = await tx.taskGroup.findMany({
      where: { userId: guestUserId }
    });

    // Get existing task groups from the authenticated user to avoid duplicates
    const authTaskGroups = await tx.taskGroup.findMany({
      where: { userId: authUserId }
    });

    // Create a map for tracking old to new task group IDs
    const taskGroupIdMap = new Map<string, string>();

    // Process each guest task group
    for (const guestGroup of guestTaskGroups) {
      // Check if a similar group already exists (by name)
      const existingGroup = authTaskGroups.find(g => g.name === guestGroup.name);

      if (existingGroup) {
        // Map the guest group ID to the existing auth group ID
        taskGroupIdMap.set(guestGroup.id, existingGroup.id);
      } else {
        // Create a new task group for the authenticated user
        const newGroup = await tx.taskGroup.create({
          data: {
            name: guestGroup.name,
            emoji: guestGroup.emoji,
            color: guestGroup.color,
            description: guestGroup.description,
            position: guestGroup.position,
            userId: authUserId
          }
        });

        // Map the guest group ID to the new group ID
        taskGroupIdMap.set(guestGroup.id, newGroup.id);
      }
    }

    // Store the task group ID mapping for task migration
    return Promise.resolve();
  }

  /**
   * Migrate tasks from guest user to authenticated user
   */
  private static async migrateTasks(tx: Prisma.TransactionClient, guestUserId: string, authUserId: string): Promise<void> {
    // Get all tasks from the guest user
    const guestTasks = await tx.task.findMany({
      where: { userId: guestUserId },
      include: { subTasks: true }
    });

    // Process each guest task
    for (const guestTask of guestTasks) {
      // Create a new task for the authenticated user
      const newTask = await tx.task.create({
        data: {
          title: guestTask.title,
          description: guestTask.description,
          status: guestTask.status,
          priority: guestTask.priority,
          importanceScore: guestTask.importanceScore,
          urgencyScore: guestTask.urgencyScore,
          dueDate: guestTask.dueDate,
          completedAt: guestTask.completedAt,
          auraPoints: guestTask.auraPoints,
          userId: authUserId,
          // If the task was in a group, assign it to the corresponding new group
          taskGroupId: guestTask.taskGroupId ?
            (await tx.taskGroup.findFirst({
              where: {
                userId: authUserId,
                name: (await tx.taskGroup.findUnique({ where: { id: guestTask.taskGroupId } })).name
              }
            }))?.id : null
        }
      });

      // Migrate subtasks if any
      if (guestTask.subTasks && guestTask.subTasks.length > 0) {
        for (const subTask of guestTask.subTasks) {
          await tx.subTask.create({
            data: {
              title: subTask.title,
              completed: subTask.completed,
              position: subTask.position,
              taskId: newTask.id
            }
          });
        }
      }
    }

    return Promise.resolve();
  }

  /**
   * Migrate user statistics from guest user to authenticated user
   */
  private static async migrateUserStats(tx: Prisma.TransactionClient, guestUserId: string, authUserId: string): Promise<void> {
    // Get guest user stats
    const guestUser = await tx.user.findUnique({
      where: { id: guestUserId }
    });

    // Get authenticated user
    const authUser = await tx.user.findUnique({
      where: { id: authUserId }
    });

    // Merge stats (take the higher values)
    await tx.user.update({
      where: { id: authUserId },
      data: {
        auraPoints: Math.max(authUser.auraPoints || 0, guestUser.auraPoints || 0),
        currentStreak: Math.max(authUser.currentStreak || 0, guestUser.currentStreak || 0),
        longestStreak: Math.max(authUser.longestStreak || 0, guestUser.longestStreak || 0),
        // If the guest user completed onboarding, mark the auth user as having completed it too
        onboardingDone: authUser.onboardingDone || guestUser.onboardingDone
      }
    });

    return Promise.resolve();
  }

  /**
   * Handle the authentication process and data migration
   * @param authUser The authenticated user from Supabase Auth
   * @returns True if the process was successful, false otherwise
   */
  static async handleAuthUpgrade(authUser: { id: string; email?: string }): Promise<boolean> {
    try {
      // Check if we have a guest user to migrate from
      const guestUserId = GuestUserManager.getGuestUserId();

      if (!guestUserId) {
        // No guest user to migrate from
        return true;
      }

      // Check if the guest user is different from the authenticated user
      if (guestUserId === authUser.id) {
        // The guest user is the same as the authenticated user (shouldn't happen)
        GuestUserManager.cleanupGuestData();
        return true;
      }

      // Migrate data from guest to authenticated user
      const migrationSuccess = await this.migrateGuestData(guestUserId, authUser.id);

      if (migrationSuccess) {
        // Clean up guest data after successful migration
        GuestUserManager.cleanupGuestData();
      }

      return migrationSuccess;
    } catch (error) {
      console.error("Error handling auth upgrade:", error);
      return false;
    }
  }
}