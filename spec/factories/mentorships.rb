FactoryBot.define do
  factory :mentorship do
    mentor_id { create(:user, role: :mentor).id }
    mentee_id { create(:user, role: :mentee).id }
  end
end
