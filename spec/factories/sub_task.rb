FactoryBot.define do
  factory :sub_task do
    name { 'Sub Task 1' }
    description { 'This is a sub task' }
    deadline { 1.week.from_now }
    users_id { create(:user).id }
    main_tasks_id { create(:main_task, users_id: users_id).id }
  end
end
