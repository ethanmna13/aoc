class Mentorship < ApplicationRecord
  belongs_to :mentor, class_name: "User", foreign_key: "mentor_id"
  belongs_to :mentee, class_name: "User", foreign_key: "mentee_id"
  has_many :assigned_main_task, foreign_key: "mentorships_id"
  has_many :assigned_sub_task, foreign_key: "mentorships_id"
end
