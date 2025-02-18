class AddColumnsToMentorships < ActiveRecord::Migration[8.0]
  def change
    create_table "mentorships", force: :cascade do |t|
      t.integer "mentor_id", null: false
      t.integer "mentee_id", null: false
      t.string "status", default: "Pending"
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.integer "main_task_id"
      t.integer "sub_task_id"
      t.index [ "main_task_id" ], name: "index_mentorships_on_main_task_id"
      t.index [ "sub_task_id" ], name: "index_mentorships_on_sub_task_id"
      t.index [ "mentor_id" ], name: "index_mentorships_on_mentor_id"
      t.index [ "mentee_id" ], name: "index_mentorships_on_mentee_id"
    end

    add_foreign_key "mentorships", "users", column: "mentor_id"
    add_foreign_key "mentorships", "users", column: "mentee_id"
    add_foreign_key "mentorships", "main_tasks", column: "main_task_id"
    add_foreign_key "mentorships", "sub_tasks", column: "sub_task_id"
  end
end
