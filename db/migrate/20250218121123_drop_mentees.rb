class DropMentees < ActiveRecord::Migration[8.0]
  def change
    drop_table :mentees
  end
end
