class Mentee < ApplicationRecord
  belongs_to :users
  has_many :mentorships
end
