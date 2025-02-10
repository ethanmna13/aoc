class CreateMainTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :main_tasks do |t|
      t.string :name
      t.string :description
      t.datetime :duration
      t.references :users, null: false, foreign_key: true

      t.timestamps
    end
  end
end
