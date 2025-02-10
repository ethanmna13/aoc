class CreateSubTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :sub_tasks do |t|
      t.integer :authority
      t.string :name
      t.string :description
      t.datetime :duration
      t.references :main_tasks, null: false, foreign_key: true
      t.references :users, null: false, foreign_key: true

      t.timestamps
    end
  end
end
