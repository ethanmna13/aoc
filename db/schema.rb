# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_02_09_153541) do
  create_table "main_tasks", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.datetime "duration"
    t.integer "users_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["users_id"], name: "index_main_tasks_on_users_id"
  end

  create_table "sub_tasks", force: :cascade do |t|
    t.integer "authority"
    t.string "name"
    t.string "description"
    t.datetime "duration"
    t.integer "main_tasks_id", null: false
    t.integer "users_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["main_tasks_id"], name: "index_sub_tasks_on_main_tasks_id"
    t.index ["users_id"], name: "index_sub_tasks_on_users_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "name"
    t.integer "role"
    t.integer "account_status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "main_tasks", "users", column: "users_id"
  add_foreign_key "sub_tasks", "main_tasks", column: "main_tasks_id"
  add_foreign_key "sub_tasks", "users", column: "users_id"
end
