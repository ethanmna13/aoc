FactoryBot.define do
  factory :mentorship do
    mentors { nil }
    mentees { nil }
    status { "MyString" }
    submissions { nil }
  end
end
