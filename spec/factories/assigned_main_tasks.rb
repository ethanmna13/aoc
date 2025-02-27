FactoryBot.define do
  factory :assigned_main_task do
    mentorships_id { create(:mentorship).id }
    main_tasks_id { create(:main_task).id }
    status { :not_started }
  end
end
