class AssignedSubTask < ApplicationRecord
  belongs_to :mentorships
  belongs_to :assigned_main_tasks
  has_many_attached :sub_task_attachments
  has_many_attached :submission_attachments
end
