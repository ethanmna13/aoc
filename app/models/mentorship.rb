class Mentorship < ApplicationRecord
  belongs_to :mentor, class_name: "User", foreign_key: "mentor_id"
  belongs_to :mentee, class_name: "User", foreign_key: "mentee_id"

  has_many_attached :submissions
  has_many :assigned_main_tasks
  has_many :assigned_sub_tasks
end
