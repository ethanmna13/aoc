class RemoveColumnFromAssignedSubTasks < ActiveRecord::Migration[8.0]
  def change
    remove_column :assigned_sub_tasks, :sub_task_assign_date
  end
end
