class Mentorship < ApplicationRecord
  enum :status, { Pending: 0, In_Progress: 1, Done: 2 }

  belongs_to :mentors
  belongs_to :mentees
  has_many_attached :submissions
  has_many :assigned_main_tasks
  has_many :assigned_sub_tasks
end
