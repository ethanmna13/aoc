class CreateAssignedMainTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :assigned_main_tasks do |t|
      t.references :mentorships, null: false, foreign_key: true
      t.integer :main_task_id
      t.string :main_task_name
      t.string :main_task_status
      t.datetime :main_task_assign_date
      t.string :edited_by
      t.string :completed_by

      t.timestamps
    end
  end
end
