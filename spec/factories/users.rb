FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { '1234abcd' }
    name { Faker::Name.name }
    role { :admin }
    account_status { :active }
  end

  trait :admin do
    role { :admin }
  end

  trait :mentor do
    role { :mentor }
  end

  trait :mentee do
    role { :mentee }
  end

  trait :inactive do
    account_status { :inactive }
  end

  trait :active do
    account_status { :active }
  end
end
