FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { '1234abcd' }
    name { Faker::Name.name }
    role { :admin }
    account_status { :active }
  end
end
