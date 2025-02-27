class Mentorship < ApplicationRecord
  belongs_to :mentor, class_name: "User", foreign_key: "mentor_id"
  belongs_to :mentee, class_name: "User", foreign_key: "mentee_id"
  has_many :assigned_main_task, foreign_key: "mentorships_id"
  has_many :assigned_sub_task, foreign_key: "mentorships_id"

  validates :mentor_id, presence: true
  validates :mentee_id, presence: true

  def self.ransackable_attributes(auth_object = nil)
    %w[created_at updated_at mentor_id]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[mentor mentee]
  end
end
