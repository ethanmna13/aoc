class RemoveColumnInMentorships < ActiveRecord::Migration[8.0]
  def change
    remove_column :mentorships, :main_task_id
  end
end
