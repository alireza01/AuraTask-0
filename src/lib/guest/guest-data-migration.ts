import { db } from "@/lib/db";
import { GuestUserManager } from "./guest-user-manager";
import { Prisma } from "@prisma/client";

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
            isGuest: false,
            guestUpgradedAt: new Date(),
            guestUpgradedToId: authUserId,
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
    const guestTaskGroups = await tx.taskGroup.findMany({
      where: { userId: guestUserId }
    });
    const authTaskGroups = await tx.taskGroup.findMany({
      where: { userId: authUserId }
    });
    const taskGroupIdMap = new Map<string, string>();

    for (const guestGroup of guestTaskGroups) {
      const existingGroup = authTaskGroups.find(g => g.name === guestGroup.name);
      if (existingGroup) {
        taskGroupIdMap.set(guestGroup.id, existingGroup.id);
      } else {
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
        taskGroupIdMap.set(guestGroup.id, newGroup.id);
      }
    }
    return Promise.resolve();
  }

  /**
   * Migrate tasks from guest user to authenticated user
   */
  private static async migrateTasks(tx: Prisma.TransactionClient, guestUserId: string, authUserId: string): Promise<void> {
    const guestTasks = await tx.task.findMany({
      where: { userId: guestUserId },
      include: { subTasks: true }
    });

    for (const guestTask of guestTasks) {
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
          taskGroupId: guestTask.taskGroupId ?
            (await tx.taskGroup.findFirst({
              where: {
                userId: authUserId,
                name: (await tx.taskGroup.findUnique({ where: { id: guestTask.taskGroupId } }))?.name
              }
            }))?.id : null
        }
      });

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
    const guestUser = await tx.user.findUnique({ where: { id: guestUserId } });
    const authUser = await tx.user.findUnique({ where: { id: authUserId } });

    if (!guestUser || !authUser) {
      return Promise.resolve();
    }

    await tx.user.update({
      where: { id: authUserId },
      data: {
        auraPoints: Math.max(authUser.auraPoints || 0, guestUser.auraPoints || 0),
        currentStreak: Math.max(authUser.currentStreak || 0, guestUser.currentStreak || 0),
        longestStreak: Math.max(authUser.longestStreak || 0, guestUser.longestStreak || 0),
        onboardingDone: authUser.onboardingDone || guestUser.onboardingDone
      }
    });

    return Promise.resolve();
  }

  /**
   * Handle the authentication process and data migration
   */
  static async handleAuthUpgrade(authUser: { id: string; email?: string }): Promise<boolean> {
    try {
      const guestUserId = GuestUserManager.getGuestUserId();
      if (!guestUserId || guestUserId === authUser.id) {
        GuestUserManager.cleanupGuestData();
        return true;
      }

      const migrationSuccess = await this.migrateGuestData(guestUserId, authUser.id);
      if (migrationSuccess) {
        GuestUserManager.cleanupGuestData();
      }
      return migrationSuccess;
    } catch (error) {
      console.error("Error handling auth upgrade:", error);
      return false;
    }
  }
}