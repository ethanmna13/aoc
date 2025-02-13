class AddDefaultValueForStatusInMentorships < ActiveRecord::Migration[8.0]
  def change
    change_column :mentorships, :status, :string, default: "Pending"
  end
end
