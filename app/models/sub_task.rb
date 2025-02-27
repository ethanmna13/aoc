class SubTask < ApplicationRecord
  belongs_to :main_task, foreign_key: "main_tasks_id"
  belongs_to :user, class_name: "User", foreign_key: "users_id"
  has_many_attached :attachments, dependent: :destroy
  has_many :assigned_sub_task

  validates :name, presence: true
  validates :users_id, presence: true
  validates :main_tasks_id, presence: true
end
