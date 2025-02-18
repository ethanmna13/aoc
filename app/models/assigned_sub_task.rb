class AssignedSubTask < ApplicationRecord
  enum :status, { in_progress: 0, completed: 1 }
  belongs_to :mentorship
  belongs_to :assigned_main_task
  belongs_to :sub_task
  has_many_attached :submission_attachments
end
