class RemoveColumnFromAssignedMainTasks < ActiveRecord::Migration[8.0]
  def change
    remove_column :assigned_main_tasks, :main_task_assign_date
  end
end
