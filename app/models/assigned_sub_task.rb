class AssignedSubTask < ApplicationRecord
  belongs_to :mentorships
  belongs_to :assigned_main_task
  belongs_to :sub_task
  has_many_attached :sub_task_attachments
  has_many_attached :submission_attachments
end
