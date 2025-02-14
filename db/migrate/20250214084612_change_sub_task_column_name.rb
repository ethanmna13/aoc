class ChangeSubTaskColumnName < ActiveRecord::Migration[8.0]
  def change
    rename_column :sub_tasks, :duration, :deadline
  end
end
