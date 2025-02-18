class ChangeColumnsInMentorships < ActiveRecord::Migration[8.0]
  def change
    create_table "mentorships", force: :cascade do |t|
      t.integer "user_id", null: false
      t.string "status", default: "Pending"
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.integer "main_tasks_id"
      t.integer "sub_tasks_id"
      t.index [ "main_tasks_id" ], name: "index_mentorships_on_main_tasks_id"
      t.index [ "sub_tasks_id" ], name: "index_mentorships_on_sub_tasks_id"
      t.index [ "user_id" ], name: "index_mentorships_on_user_id"
    end

    add_foreign_key "mentorships", "users", column: "user_id"
    add_foreign_key "mentorships", "main_tasks", column: "main_tasks_id"
    add_foreign_key "mentorships", "sub_tasks", column: "sub_tasks_id"
  end
end
