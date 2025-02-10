class MainTask < ApplicationRecord
  belongs_to :users
  has_many :sub_tasks
end
