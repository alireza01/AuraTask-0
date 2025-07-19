import { db } from "@/lib/db";
import { 
  Task, 
  TaskGroup, 
  User, 
  SubTask, 
  ActivityLog,
  TaskSchema,
  TaskGroupSchema,
  UserSchema,
  SubTaskSchema,
  ActivityLogSchema
} from "@/lib/types";
import { safeDbOperation } from "./db-utils";

/**
 * Type-safe user operations
 */
export const UserModel = {
  /**
   * Find a user by ID
   * @param id - User ID
   * @returns The user or null if not found
   */
  async findById(id: string): Promise<User | null> {
    const user = await safeDbOperation(() => db.user.findUnique({ where: { id } }));
    return user ? UserSchema.parse(user) : null;
  },

  /**
   * Find a user by email
   * @param email - User email
   * @returns The user or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await safeDbOperation(() => db.user.findUnique({ where: { email } }));
    return user ? UserSchema.parse(user) : null;
  },

  /**
   * Find a user by username
   * @param username - Username
   * @returns The user or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    const user = await safeDbOperation(() => db.user.findUnique({ where: { username } }));
    return user ? UserSchema.parse(user) : null;
  },
};

/**
 * Type-safe task operations
 */
export const TaskModel = {
  /**
   * Find a task by ID with ownership check
   * @param id - Task ID
   * @param userId - User ID for ownership check
   * @returns The task or null if not found
   */
  async findByIdWithOwnership(id: string, userId: string): Promise<Task | null> {
    const task = await safeDbOperation(() => 
      db.task.findFirst({
        where: { id, userId },
        include: { subTasks: true }
      })
    );
    return task ? TaskSchema.parse(task) : null;
  },

  /**
   * Get tasks for a user with pagination
   * @param userId - User ID
   * @param options - Query options
   * @returns Paginated tasks
   */
  async getTasksForUser(userId: string, options: {
    status?: string;
    priority?: string;
    taskGroupId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, priority, taskGroupId, page = 1, pageSize = 10 } = options;
    
    const where = {
      userId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(taskGroupId && { taskGroupId }),
    };
    
    const [total, tasks] = await Promise.all([
      db.task.count({ where }),
      db.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { subTasks: true }
      }),
    ]);
    
    const pageCount = Math.ceil(total / pageSize);
    
    return {
      data: tasks.map((task: unknown) => TaskSchema.parse(task)),
      meta: {
        total,
        page,
        pageSize,
        pageCount,
      },
    };
  },
};

/**
 * Type-safe task group operations
 */
export const TaskGroupModel = {
  /**
   * Find a task group by ID with ownership check
   * @param id - Task group ID
   * @param userId - User ID for ownership check
   * @returns The task group or null if not found
   */
  async findByIdWithOwnership(id: string, userId: string): Promise<TaskGroup | null> {
    const taskGroup = await safeDbOperation(() => 
      db.taskGroup.findFirst({
        where: { id, userId },
        include: { tasks: true }
      })
    );
    return taskGroup ? TaskGroupSchema.parse(taskGroup) : null;
  },

  /**
   * Get all task groups for a user
   * @param userId - User ID
   * @returns Array of task groups
   */
  async getAllForUser(userId: string): Promise<TaskGroup[]> {
    const taskGroups = await safeDbOperation(() => 
      db.taskGroup.findMany({
        where: { userId },
        orderBy: { position: "asc" },
        include: { tasks: true }
      })
    );
    return Array.isArray(taskGroups) 
      ? taskGroups.map((group: unknown) => TaskGroupSchema.parse(group))
      : [];
  },
};

/**
 * Type-safe subtask operations
 */
export const SubTaskModel = {
  /**
   * Find a subtask by ID with task ownership check
   * @param id - SubTask ID
   * @param userId - User ID for ownership check
   * @returns The subtask or null if not found
   */
  async findByIdWithOwnership(id: string, userId: string): Promise<SubTask | null> {
    const subTask = await safeDbOperation(() => 
      db.subTask.findFirst({
        where: { 
          id,
          task: { userId }
        },
        include: { task: true }
      })
    );
    return subTask ? SubTaskSchema.parse(subTask) : null;
  },

  /**
   * Get all subtasks for a task
   * @param taskId - Task ID
   * @param userId - User ID for ownership check
   * @returns Array of subtasks
   */
  async getAllForTask(taskId: string, userId: string): Promise<SubTask[]> {
    const subTasks = await safeDbOperation(() => 
      db.subTask.findMany({
        where: { 
          taskId,
          task: { userId }
        },
        orderBy: { position: "asc" }
      })
    );
    return Array.isArray(subTasks) 
      ? subTasks.map((subTask: unknown) => SubTaskSchema.parse(subTask))
      : [];
  },
};

/**
 * Type-safe activity log operations
 */
export const ActivityLogModel = {
  /**
   * Get recent activity logs for a user
   * @param userId - User ID
   * @param limit - Maximum number of logs to return
   * @returns Array of activity logs
   */
  async getRecentForUser(userId: string, limit: number = 10): Promise<ActivityLog[]> {
    const logs = await safeDbOperation(() => 
      db.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { task: true }
      })
    );
    return Array.isArray(logs) 
      ? logs.map((log: unknown) => ActivityLogSchema.parse(log))
      : [];
  },

  /**
   * Get activity logs for a specific task
   * @param taskId - Task ID
   * @param userId - User ID for ownership check
   * @returns Array of activity logs
   */
  async getForTask(taskId: string, userId: string): Promise<ActivityLog[]> {
    const logs = await safeDbOperation(() => 
      db.activityLog.findMany({
        where: { 
          taskId,
          userId
        },
        orderBy: { createdAt: "desc" }
      })
    );
    return Array.isArray(logs) 
      ? logs.map((log: unknown) => ActivityLogSchema.parse(log))
      : [];
  },
};