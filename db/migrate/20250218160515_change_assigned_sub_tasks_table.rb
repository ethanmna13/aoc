class ChangeAssignedSubTasksTable < ActiveRecord::Migration[8.0]
  def change
    create_table "assigned_sub_tasks", force: :cascade do |t|
      t.integer "mentorships_id", null: false
      t.integer "sub_task_id", null: false
      t.integer "assigned_main_tasks_id", null: false
      t.integer "status", default: 0
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.index [ "assigned_main_tasks_id" ], name: "index_assigned_sub_tasks_on_assigned_main_tasks_id"
      t.index [ "mentorships_id" ], name: "index_assigned_sub_tasks_on_mentorships_id"
      t.index [ "sub_task_id" ], name: "index_assigned_sub_tasks_on_sub_task_id"
    end
    add_foreign_key "assigned_sub_tasks", "assigned_main_tasks", column: "assigned_main_tasks_id"
    add_foreign_key "assigned_sub_tasks", "mentorships", column: "mentorships_id"
    add_foreign_key "assigned_sub_tasks", "sub_tasks", column: "sub_task_id"
  end
end
