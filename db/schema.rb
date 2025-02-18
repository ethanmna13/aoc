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

ActiveRecord::Schema[8.0].define(version: 2025_02_17_152532) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "assigned_main_tasks", force: :cascade do |t|
    t.integer "mentorships_id", null: false
    t.integer "main_task_id"
    t.string "main_task_name"
    t.string "main_task_status"
    t.string "edited_by"
    t.string "completed_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["mentorships_id"], name: "index_assigned_main_tasks_on_mentorships_id"
  end

  create_table "assigned_sub_tasks", force: :cascade do |t|
    t.integer "mentorships_id", null: false
    t.integer "sub_task_id"
    t.string "sub_task_name"
    t.string "sub_task_status"
    t.integer "assigned_main_tasks_id", null: false
    t.string "edited_by"
    t.string "completed_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assigned_main_tasks_id"], name: "index_assigned_sub_tasks_on_assigned_main_tasks_id"
    t.index ["mentorships_id"], name: "index_assigned_sub_tasks_on_mentorships_id"
  end

  create_table "main_tasks", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.datetime "deadline"
    t.integer "users_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["users_id"], name: "index_main_tasks_on_users_id"
  end

  create_table "mentees", force: :cascade do |t|
    t.integer "users_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["users_id"], name: "index_mentees_on_users_id"
  end

  create_table "mentors", force: :cascade do |t|
    t.integer "users_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["users_id"], name: "index_mentors_on_users_id"
  end

  create_table "mentorships", force: :cascade do |t|
    t.integer "mentors_id", null: false
    t.integer "mentees_id", null: false
    t.string "status", default: "Pending"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "main_tasks_id", null: false
    t.integer "sub_tasks_id", null: false
    t.index ["main_tasks_id"], name: "index_mentorships_on_main_tasks_id"
    t.index ["mentees_id"], name: "index_mentorships_on_mentees_id"
    t.index ["mentors_id"], name: "index_mentorships_on_mentors_id"
    t.index ["sub_tasks_id"], name: "index_mentorships_on_sub_tasks_id"
  end

  create_table "sub_tasks", force: :cascade do |t|
    t.integer "authority"
    t.string "name"
    t.string "description"
    t.datetime "deadline"
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
    t.string "jti"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "assigned_main_tasks", "mentorships", column: "mentorships_id"
  add_foreign_key "assigned_sub_tasks", "assigned_main_tasks", column: "assigned_main_tasks_id"
  add_foreign_key "assigned_sub_tasks", "mentorships", column: "mentorships_id"
  add_foreign_key "main_tasks", "users", column: "users_id"
  add_foreign_key "mentees", "users", column: "users_id"
  add_foreign_key "mentors", "users", column: "users_id"
  add_foreign_key "mentorships", "main_tasks", column: "main_tasks_id"
  add_foreign_key "mentorships", "mentees", column: "mentees_id"
  add_foreign_key "mentorships", "mentors", column: "mentors_id"
  add_foreign_key "mentorships", "sub_tasks", column: "sub_tasks_id"
  add_foreign_key "sub_tasks", "main_tasks", column: "main_tasks_id"
  add_foreign_key "sub_tasks", "users", column: "users_id"
end
