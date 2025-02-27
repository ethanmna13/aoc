FactoryBot.define do
  factory :main_task do
    name { 'Task 1' }
    description { 'This is a main task' }
    deadline { 1.week.from_now }
    users_id { create(:user).id }
  end
end
