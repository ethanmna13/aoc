class ChangeMainTaskColumnName < ActiveRecord::Migration[8.0]
  def change
    rename_column :main_tasks, :duration, :deadline
  end
end
