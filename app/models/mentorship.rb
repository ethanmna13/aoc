class Mentorship < ApplicationRecord
  enum :status, { Pending: 0, In_Progress: 1, Done: 2 }

  belongs_to :mentor, class_name: "User", foreign_key: "mentors_id"
  belongs_to :mentee, class_name: "User", foreign_key: "mentees_id"
  belongs_to :main_task, class_name: "MainTask", foreign_key: "main_tasks_id", optional: true
  belongs_to :sub_task, class_name: "SubTask", foreign_key: "sub_tasks_id", optional: true

  has_many_attached :submissions
  has_many :assigned_main_tasks
  has_many :assigned_sub_tasks
end
