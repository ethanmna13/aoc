class CreateMentorships < ActiveRecord::Migration[8.0]
  def change
    create_table :mentorships do |t|
      t.references :mentors, null: false, foreign_key: true
      t.references :mentees, null: false, foreign_key: true
      t.string :status

      t.timestamps
    end
  end
end
