class AssignedMainTask < ApplicationRecord
  belongs_to :mentorship
  belongs_to :main_task
  has_many :assigned_sub_tasks
end
