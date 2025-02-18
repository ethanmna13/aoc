class DropMentors < ActiveRecord::Migration[8.0]
  def change
    drop_table :mentors
  end
end
