FactoryBot.define do
  factory :assigned_sub_task do
    mentorships { nil }
    sub_task_id { 1 }
    sub_task_name { "MyString" }
    sub_task_status { "MyString" }
    sub_task_assign_date { "2025-02-13 13:46:12" }
    assigned_main_tasks { nil }
    edited_by { "MyString" }
    sub_task_attachments { nil }
    submission_attachments { nil }
    completed_by { "MyString" }
  end
end
