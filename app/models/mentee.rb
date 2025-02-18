class Mentee < ApplicationRecord
  belongs_to :user, foreign_key: "users_id"
  has_many :mentorships, foreign_key: "mentees_id"
end
