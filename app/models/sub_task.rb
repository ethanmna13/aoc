class SubTask < ApplicationRecord
  belongs_to :main_tasks
  belongs_to :users
  has_many_attached :attachment
end
