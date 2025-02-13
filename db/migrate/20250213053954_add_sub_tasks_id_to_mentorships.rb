class AddSubTasksIdToMentorships < ActiveRecord::Migration[8.0]
  def change
    add_reference :mentorships, :sub_tasks, null: false, foreign_key: true
  end
end
