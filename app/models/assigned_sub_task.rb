class AssignedSubTask < ApplicationRecord
  enum :status, { not_started: 0, in_progress: 1, completed: 2 }
  belongs_to :mentorship, class_name: "Mentorship", foreign_key: "mentorships_id"
  belongs_to :assigned_main_task, class_name: "AssignedMainTask", foreign_key: "assigned_main_tasks_id"
  belongs_to :sub_task, class_name: "SubTask", foreign_key: "sub_task_id"
  has_many_attached :submissions

  validates :mentorships_id, presence: true
  validates :assigned_main_tasks_id, presence: true
  validates :sub_task_id, presence: true
  validates :status, presence: true

  def self.ransackable_attributes(auth_object = nil)
    %w[id sub_tasks_id mentorships_id status created_at updated_at assigned_main_tasks_id]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[mentorship sub_task assigned_main_task]
  end
end
