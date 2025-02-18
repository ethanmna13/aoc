class MainTask < ApplicationRecord
  belongs_to :user, class_name: "User", foreign_key: "users_id"
  has_many :sub_tasks, foreign_key: "main_tasks_id"
  has_many :assigned_main_tasks
end
