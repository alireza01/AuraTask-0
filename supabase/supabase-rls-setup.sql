-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only read their own profile
CREATE POLICY "Users can view their own profile only"
ON users
FOR SELECT
USING ((auth.uid() = id));

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile only"
ON users
FOR UPDATE
USING ((auth.uid() = id))
WITH CHECK ((auth.uid() = id));

-- Task Groups policies
-- Users can only view their own task groups
CREATE POLICY "Users can view their own task groups"
ON task_groups
FOR SELECT
USING ((auth.uid() = user_id));

-- Users can only insert task groups for themselves
CREATE POLICY "Users can create their own task groups"
ON task_groups
FOR INSERT
WITH CHECK ((auth.uid() = user_id));

-- Users can only update their own task groups
CREATE POLICY "Users can update their own task groups"
ON task_groups
FOR UPDATE
USING ((auth.uid() = user_id))
WITH CHECK ((auth.uid() = user_id));

-- Users can only delete their own task groups
CREATE POLICY "Users can delete their own task groups"
ON task_groups
FOR DELETE
USING ((auth.uid() = user_id));

-- Tasks policies
-- Users can only view their own tasks
CREATE POLICY "Users can view their own tasks"
ON tasks
FOR SELECT
USING ((auth.uid() = user_id));

-- Users can only insert tasks for themselves
CREATE POLICY "Users can create their own tasks"
ON tasks
FOR INSERT
WITH CHECK ((auth.uid() = user_id));

-- Users can only update their own tasks
CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
USING ((auth.uid() = user_id))
WITH CHECK ((auth.uid() = user_id));

-- Users can only delete their own tasks
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
USING ((auth.uid() = user_id));

-- Sub Tasks policies
-- Users can view sub tasks of their own tasks
CREATE POLICY "Users can view sub tasks of their own tasks"
ON sub_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = sub_tasks.task_id
    AND tasks.user_id = auth.uid()
  )
);

-- Users can insert sub tasks to their own tasks
CREATE POLICY "Users can create sub tasks for their own tasks"
ON sub_tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = sub_tasks.task_id
    AND tasks.user_id = auth.uid()
  )
);

-- Users can update sub tasks of their own tasks
CREATE POLICY "Users can update sub tasks of their own tasks"
ON sub_tasks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = sub_tasks.task_id
    AND tasks.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = sub_tasks.task_id
    AND tasks.user_id = auth.uid()
  )
);

-- Users can delete sub tasks of their own tasks
CREATE POLICY "Users can delete sub tasks of their own tasks"
ON sub_tasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = sub_tasks.task_id
    AND tasks.user_id = auth.uid()
  )
);

-- Activity Logs policies
-- Users can only view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON activity_logs
FOR SELECT
USING ((auth.uid() = user_id));

-- Users can only insert activity logs for themselves
CREATE POLICY "Users can create their own activity logs"
ON activity_logs
FOR INSERT
WITH CHECK ((auth.uid() = user_id));

-- No update policy for activity logs as they should be immutable
-- No delete policy for activity logs as they should be preserved