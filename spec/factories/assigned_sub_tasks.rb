FactoryBot.define do
  factory :assigned_sub_task do
    mentorships_id { create(:mentorship).id }
    assigned_main_tasks_id { create(:assigned_main_task).id }
    sub_task_id { create(:sub_task).id }
    status { :not_started }
  end
end
