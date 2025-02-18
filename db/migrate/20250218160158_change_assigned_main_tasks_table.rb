class ChangeAssignedMainTasksTable < ActiveRecord::Migration[8.0]
  def change
    create_table "assigned_main_tasks", force: :cascade do |t|
      t.integer "mentorships_id", null: false
      t.integer "main_tasks_id", null: false
      t.integer "status", default: 0
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.index ["mentorships_id"], name: "index_assigned_main_tasks_on_mentorships_id"
      t.index ["main_tasks_id"], name: "index_assigned_main_tasks_on_main_tasks_id"
    end
    add_foreign_key "assigned_main_tasks", "mentorships", column: "mentorships_id"
    add_foreign_key "assigned_main_tasks", "main_tasks", column: "main_tasks_id"
  end
end
