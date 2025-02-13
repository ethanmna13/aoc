class CreateAssignedSubTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :assigned_sub_tasks do |t|
      t.references :mentorships, null: false, foreign_key: true
      t.integer :sub_task_id
      t.string :sub_task_name
      t.string :sub_task_status
      t.datetime :sub_task_assign_date
      t.references :assigned_main_tasks, null: false, foreign_key: true
      t.string :edited_by
      t.string :completed_by

      t.timestamps
    end
  end
end
