FactoryBot.define do
  factory :assigned_main_task do
    mentorships { nil }
    main_task_id { 1 }
    main_task_name { "MyString" }
    main_task_status { "MyString" }
    main_task_assign_date { "2025-02-13 13:43:03" }
    edited_by { "MyString" }
    completed_by { "MyString" }
  end
end
