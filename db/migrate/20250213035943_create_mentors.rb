class CreateMentors < ActiveRecord::Migration[8.0]
  def change
    create_table :mentors do |t|
      t.references :users, null: false, foreign_key: true

      t.timestamps
    end
  end
end
