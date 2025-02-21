class AssignedMainTask < ApplicationRecord
  enum :status, { in_progress: 0, completed: 1 }
  belongs_to :mentorship, class_name: "Mentorship", foreign_key: "mentorships_id"
  belongs_to :main_task, class_name: "MainTask", foreign_key: "main_tasks_id"
  has_many :assigned_sub_task, foreign_key: "assigned_main_tasks_id", dependent: :destroy
end
