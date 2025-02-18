class AssignedMainTask < ApplicationRecord
  enum :status, { in_progress: 0, completed: 1 }
  belongs_to :mentorship
  belongs_to :main_task
  has_many :assigned_sub_tasks
end
