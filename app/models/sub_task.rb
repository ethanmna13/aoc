class SubTask < ApplicationRecord
  enum :authority, { admin: 0, mentor: 1, mentee: 2 }
  belongs_to :main_task, foreign_key: "main_tasks_id"
  belongs_to :user, class_name: "User", foreign_key: "users_id"
  has_many_attached :attachments, dependent: :destroy
end
