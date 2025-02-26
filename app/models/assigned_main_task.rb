class AssignedMainTask < ApplicationRecord
  enum :status, { not_started: 0, in_progress: 1, completed: 2 }
  belongs_to :mentorship, class_name: "Mentorship", foreign_key: "mentorships_id"
  belongs_to :main_task, class_name: "MainTask", foreign_key: "main_tasks_id"
  has_many :assigned_sub_task, foreign_key: "assigned_main_tasks_id", dependent: :destroy
  has_many_attached :submissions

  def self.ransackable_attributes(auth_object = nil)
    %w[id mentorships_id main_tasks_id status]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[mentorship main_task]
  end
end
