class AssignedSubTask < ApplicationRecord
  enum :status, { in_progress: 0, completed: 1 }
  belongs_to :mentorship, class_name: "Mentorship", foreign_key: "mentorships_id"
  belongs_to :assigned_main_task, class_name: "AssignedMainTask", foreign_key: "assigned_main_tasks_id"
  belongs_to :sub_task, class_name: "SubTask", foreign_key: "sub_task_id"
  has_many_attached :submissions
end
