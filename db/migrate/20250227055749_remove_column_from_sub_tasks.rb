class RemoveColumnFromSubTasks < ActiveRecord::Migration[8.0]
  def change
    remove_column :sub_tasks, :authority
  end
end
